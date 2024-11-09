from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from users.models import UserProfile
from urllib.parse import parse_qs
import jwt
import logging

logger = logging.getLogger(__name__)

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        token = None
        if 'query_string' in scope:
            query_string = scope['query_string'].decode('utf-8')
            parsed_qs = parse_qs(query_string)
            token = parsed_qs.get('token', [None])[0]
        if token:
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                user_id = payload.get('user_id') 
                user = await self.get_user(user_id) 
                scope['user'] = user
            except jwt.ExpiredSignatureError:
                scope['user'] = AnonymousUser()
            except jwt.DecodeError:
                scope['user'] = AnonymousUser()
            except Exception as e:
                scope['user'] = AnonymousUser()
        else:
            logger.warning('Error, No Token Provided')
        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return UserProfile.objects.get(id=user_id)
        except UserProfile.DoesNotExist:
            return AnonymousUser()
