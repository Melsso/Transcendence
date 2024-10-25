from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import jwt
import json
from django.conf import settings
from users.models import UserProfile
from .models import Message


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = "global_room"
        self.roomGroupName = f"chat_{self.room_name}"

        await self.channel_layer.group_add(
            self.roomGroupName,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.roomGroupName,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json["action"]
        username = text_data_json["username"]
        target = text_data_json["target"]

        if (action == 'Notification'):
            lobbySettings = text_data_json["lobbySettings"]
            room_name = text_data_json["room_name"]
            await self.channel_layer.group_send(
                self.roomGroupName, {
                    "type": "Notification",
                    "action": action,
                    "username": username,
                    "target": target,
                    "room_name": room_name,
                    "lobbySettings": lobbySettings,
                }
            )
            return 
        message = text_data_json["message"]
        avatar = text_data_json["av"]

        user = await database_sync_to_async(self.get_user)(username)

        if target == 'Global':
            await database_sync_to_async(Message.objects.create)(
                sender=user,
                content=message,
                target_user=None
            )
        else:
            targ = await database_sync_to_async(self.get_user)(target)
            await database_sync_to_async(Message.objects.create)(
                sender=user,
                content=message,
                target_user=targ
            )

        await self.channel_layer.group_send(
            self.roomGroupName, {
                "type" : "sendMessage",
                "action" : action,
                "message" : message,
                "username" : username,
                "target" : target,
                "av": avatar,
            }
        )

    async def sendMessage(self, event) :
        message = event["message"]
        username = event["username"]
        target = event["target"]
        avatar = event["av"]
        await self.send(text_data=json.dumps({"message":message, "username":username, "target":target, "av": avatar}))
    
    async def Notification(self, event):
        action = event["action"]
        username = event["username"]
        target = event["target"]
        room_name = event["room_name"]
        lobbySettings = event["lobbySettings"]
        await self.send(text_data=json.dumps({"action":action, "username":username, "target":target, "room_name":room_name, "lobbySettings":lobbySettings}))


    def get_user(self, username):
        return UserProfile.objects.get(username=username)
