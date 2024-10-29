import jwt
from channels.middleware import BaseMiddleware
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from users.models import UserProfile
import logging
from urllib.parse import parse_qs

logger = logging.getLogger(__name__)

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        token = None
        logger.warning(scope)
        if 'query_string' in scope:
            query_string = scope['query_string'].decode('utf-8')
            parsed_qs = parse_qs(query_string)
            token = parsed_qs.get('token', [None])[0]
        
        if token:
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                logger.debug(f"Decoded JWT payload: {payload}")
                user_id = payload.get('user_id') 
                user = await self.get_user(user_id) 
                scope['user'] = user
            except jwt.ExpiredSignatureError:
                logger.warning("JWT has expired.")
                scope['user'] = AnonymousUser()
            except jwt.DecodeError:
                logger.warning("JWT decode error.")
                scope['user'] = AnonymousUser()
            except Exception as e:
                logger.error(f"Error processing token: {e}")
                scope['user'] = AnonymousUser()
        else:
            logger.warning(scope)

        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return UserProfile.objects.get(id=user_id)
        except UserProfile.DoesNotExist:
            return AnonymousUser()
