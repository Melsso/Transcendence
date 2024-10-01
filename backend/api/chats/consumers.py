from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import jwt
import json
import logging
from django.conf import settings

from .models import Chat, Message

logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        token = self.scope['query_string'].decode().get('token')
        user = await self.authenticate_user(token)


        if user is None:
            await self.close()
            return

        self.user = user
        await self.accept()
    
    async def disconnect(self, close_code):
        logger.info(f"User {self.user.username} disconnected.")
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        user2_id = text_data_json['user2_id']
        message = text_data_json['message']

        chat, created = await database_sync_to_async(self.create_or_get_chat)(self.user.id, user2_id)
        await database_sync_to_async(Message.objects.create)(chat=chat, sender=self.user, content=message)
        
        await self.channel_layer.group_send(
            f'chat_{chat.id}',
            {
                'type': 'chat_message',
                'message': message,
                'sender': self.user.username,
            }
        )

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']

        await self.send(text_data=json.dumps({
            'message': message,
            'sender': sender,
        }))
    
    async def authenticate_user(self, token):
        if token:
            return await database_sync_to_async(self.get_user_from_token)(token)
        return None

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("user_id")

            user = settings.AUTH_USER_MODEL.objects.get(id=user_id)
            return user
        except jwt.ExpiredSignatureError:
            logger.warning("Expired token.")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid token.")
            return None
        except settings.AUTH_USER_MODEL.DoesNotExist:
            logger.warning("User does not exist.")
            return None

    @database_sync_to_async
    def create_or_get_chat(self, user1_id, user2_id):
        if user1_id == user2_id:
            raise ValueError("User IDS must be different.")
    
        chat, created = Chat.objects.get_or_create(
            user1_id=user1_id,
            user2_id=user2_id
        )
        return chat