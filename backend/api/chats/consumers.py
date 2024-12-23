from django.conf import settings
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message
from users.models import UserProfile
import random
import aioredis
import json
import logging

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = "global_room"
        self.roomGroupName = f"chat_{self.room_name}"
        user = self.scope['user']
        if user.is_anonymous:
            await self.close()
        self.username = user.username
        await self.channel_layer.group_add(
            self.roomGroupName,
            self.channel_name
        )
        await self.add_user_to_redis(self.roomGroupName, self.username)
        await self.accept()
        await self.send_user_list()

    async def disconnect(self, close_code):
        await self.remove_user_from_redis(self.roomGroupName, self.username)
        await self.send_user_list()
        await self.channel_layer.group_discard(
            self.roomGroupName,
            self.channel_name
        )
        await self.handle_guest_logout(self.username)

    @database_sync_to_async
    def handle_guest_logout(self, uname):
        try:
            user = UserProfile.objects.get(username=uname)
            if user.email.endswith("@guest.local") or user.username.startswith("Guest_"):
                user.delete()
                print(f"Guest user (ID: {user_id}) disconnected and logged out.")
            else:
                pass
        except UserProfile.DoesNotExist:
            pass
        except Exception as e:
            logger.error(f'Error during guest logout (user ID: {user_id}): {str(e)}')

    async def add_user_to_redis(self, group_name, username):
        redis = await aioredis.from_url("redis://redis:6379")
        await redis.sadd(f"{group_name}_users", username)
        await redis.close()

    async def remove_user_from_redis(self, group_name, username):
        redis = await aioredis.from_url("redis://redis:6379")
        await redis.srem(f"{group_name}_users", username)
        await redis.close()

    async def get_users_in_group(self, group_name):
        redis = await aioredis.from_url("redis://redis:6379")
        users = await redis.smembers(f"{group_name}_users")
        await redis.close()
        return [user.decode("utf-8") for user in users]
    
    async def send_user_list(self):
        users = await self.get_users_in_group(self.roomGroupName)
        await self.channel_layer.group_send(
            self.roomGroupName,
            {
                "type": "user_list",
                "action": "online_status",
                "users": users
            }
        )

    async def user_list(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_list",
            "action": event["action"],
            "users": event["users"]
        }))

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json.get("action")
        username = text_data_json.get("username")
        target = text_data_json.get("target")

        if action == 'Game_left':
            await self.channel_layer.group_send(
                self.roomGroupName, {
                    "type": "sendGameLeft",
                    "action": action,
                    "username": username,
                    "target": target,
                }
            )
            return

        elif action == 'Notification':
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
        elif action == 'TNotification':
            Slobby = text_data_json.get("Slobby")
            players = text_data_json.get("players")
            owner = text_data_json.get("owner")
            await self.channel_layer.group_send(
                self.roomGroupName, {
                    "type": "TNotification",
                    "action": action,
                    "owner": owner,
                    "target": target,
                    "players": players,
                    "Slobby": Slobby,
                }
            )
            return

        elif action == 'TMatchups':
            Slobby = text_data_json.get("Slobby")
            players = text_data_json.get("players")
            owner = text_data_json.get("owner")
            await self.channel_layer.group_send(
                self.roomGroupName, {
                    "type": "TMatchups",
                    "action": action,
                    "owner": owner,
                    "players": players,
                    "Slobby": Slobby,
                }
            )
            return

        elif action == 'TournoiRoom':
            Slobby = text_data_json.get("Slobby")
            if not Slobby:
                Slobby = {
                    "mode": random.choice(['Default Mode', 'Buff Mode']),
			        "map": random.choice(['Map 1', 'Map 2', 'Map 3'])
                }
            players = text_data_json.get("players")
            room_name = text_data_json.get("room_name")
            await self.channel_layer.group_send(
                self.roomGroupName, {
                    "type": "TRoom",
                    "action": action,
                    "players": players,
                    "Slobby": Slobby,
                    "room_name": room_name,
                }
            )
            return

        elif action == 'TournoiGameRes':
            players = text_data_json.get("players")
            await self.channel_layer.group_send(
                self.roomGroupName, {
                    "type": "TGameRes",
                    "action": action,
                    "players": players,
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

    async def sendMessage(self, event):
        message = event["message"]
        username = event["username"]
        target = event["target"]
        avatar = event["av"]
        await self.send(text_data=json.dumps({"message":message, "username":username, "target":target, "av": avatar}))

    async def TGameRes(self, event):
        action = event["action"]
        players = event["players"]
        await self.send(text_data=json.dumps({"action":action, "players":players}))

    async def TRoom(self, event):
        action = event["action"]
        players = event["players"]
        Slobby = event["Slobby"]
        room_name = event["room_name"]
        await self.send(text_data=json.dumps({"action":action, "players":players, "Slobby":Slobby, "room_name": room_name}))

    async def TNotification(self, event):
        action = event["action"]
        owner = event["owner"]
        target = event["target"]
        players = event["players"]
        Slobby = event["Slobby"]
        await self.send(text_data=json.dumps({"action":action, "owner":owner, "target":target, "players":players, "Slobby":Slobby}))

    async def TMatchups(self, event):
        action = event["action"]
        players = event["players"]
        owner = event["owner"]
        Slobby = event["Slobby"]
        await self.send(text_data=json.dumps({"action":action, "players":players, "owner":owner, "Slobby":Slobby}))

    async def Notification(self, event):
        action = event["action"]
        username = event["username"]
        target = event["target"]
        room_name = event["room_name"]
        lobbySettings = event["lobbySettings"]
        await self.send(text_data=json.dumps({"action":action, "username":username, "target":target, "room_name":room_name, "lobbySettings":lobbySettings}))

    def get_user(self, username):
        return UserProfile.objects.get(username=username)

    async def sendGameLeft(self, event):
        username = event['username']
        target = event['target']
        action = event['action']
        await self.send(text_data=json.dumps({"action":action, "username":username, "target":target}))
