from channels.generic.websocket import AsyncWebsocketConsumer
from channels_redis.core import RedisChannelLayer
import aioredis
import json
import logging
import asyncio
from django.conf import settings
from channels.db import database_sync_to_async
from users.models import UserProfile
from users.serializers import UserProfileSerializer
from .models import PongGame, RrGame, Game

logger = logging.getLogger(__name__)

class GameConsumer(AsyncWebsocketConsumer):
	redis_room_prefix = 'game_room_'
	async def connect(self):
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		self.room_group_name = f'{self.room_name}'
		user = self.scope['user']
		if user.is_anonymous:
			await self.close()
		self.redis_key = self.redis_room_prefix + self.room_group_name
 		
		players_in_room = await self.get_players_in_room()
		
		if len(players_in_room) >= 2:
			await self.close()
			return 
		
		await self.add_player_to_room(user.username)
		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		await self.accept()

		players_in_room = await self.get_players_in_room()
		await self.send_current_players(players_in_room)

	async def disconnect(self, close_code):
		user = self.scope['user']
		await self.remove_player_from_room(user.username)
		players_in_room = await self.get_players_in_room()

		if players_in_room:
			await self.send_current_players(players_in_room)

		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)

	async def receive(self, text_data):
		try:
			data = json.loads(text_data)
			action = data['action']
			state = data['state']
			if action == 'game_action':
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'game_action',
						'action': action,
						'state': state
					}
				)
			elif action == 'player_action':
				await self.channel_layer.group_send(
					self.room_group_name,
					{
						'type': 'player_action',
						'action': action,
						'state': state
					}
				)
		except KeyError:
			await self.send(text_data=json.dumps({'error': 'Invalid data received'}))
		except Exception as e:
			await self.send(text_data=json.dumps({'error': str(e)}))


	async def player_action(self, event):
		action = event['action']
		players = event['players']

		await self.send(text_data=json.dumps({
			'action': action,
			'players': players
		}))

	async def game_action(self, event):
		action = event['action']
		state = event['state']

		await self.send(text_data=json.dumps({
			'action': action,
			'state': state
		}))
	

	async def add_player_to_room(self, player_name):
		redis = await aioredis.from_url("redis://redis:6379")
		player_data = {
			"username": player_name,
			"ready": False
		}
		await redis.hset(self.redis_key, player_name, json.dumps(player_data))
		# await redis.rpush(self.redis_key, player_name)
		await redis.close()

	async def get_players_in_room(self):
		redis = await aioredis.from_url("redis://redis:6379")
		players_dict = await redis.hgetall(self.redis_key)
		await redis.close()
		players = {k.decode('utf-8'): json.loads(v) for k, v in players_dict.items()}
		return players

	async def remove_player_from_room(self, player_name):
		redis = await aioredis.from_url("redis://redis:6379")
		logger.warning(player_name)
		await redis.hdel(self.redis_key, player_name)
		# await redis.lrem(self.redis_key, 0, player_name)
		players = await redis.hgetall(self.redis_key)
		logger.warning(players)
		if not players:
			await redis.delete(self.redis_key)
		await redis.close()
	
	async def update_player_ready(self, player_name, ready_status):
		redis = await aioredis.from_url("redis://redis:6379")
		player_data_raw = await redis.hget(self.redis_key, player_name)
		if player_data_raw:
			player_data = json.loads(player_data_raw)
			player_data["ready"] = ready_status
			await redis.hset(self.redis_key, player_name, json.dumps(player_data))
		await redis.close()

	async def get_user_profiles(self, players):
		player_usernames = [player_data['username'] for player_data in players.values()]
		player_usernames = [username.decode('utf-8') if isinstance(username, bytes) else username for username in player_usernames]

		user_profiles = await database_sync_to_async(lambda: list(UserProfile.objects.filter(username__in=player_usernames)))()
		serializer = UserProfileSerializer(user_profiles, many=True)
		return serializer.data

	async def send_current_players(self, players):
		user_profiles = await self.get_user_profiles(players)
		for profile in user_profiles:
			profile['ready'] = players[profile['username']]['ready']
		await self.channel_layer.group_send(
			self.room_group_name,
            {
				'type': 'player_action',
				'action': 'current_players',
				'players': user_profiles
			}
		)

class TournamentConsumer(AsyncWebsocketConsumer):
	redis_room_prefix = 'game_room_'
	async def connect(self):
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		self.room_group_name = f'{self.room_name}'
		user = self.scope['user']
		if user.is_anonymous:
			await self.close()
		self.redis_key = self.redis_room_prefix + self.room_group_name
 		
		players_in_room = await self.get_players_in_room()
		
		if len(players_in_room) >= 8:
			await self.close()
			return 
		
		await self.add_player_to_room(user.username)
		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		await self.accept()

		players_in_room = await self.get_players_in_room()
		await self.send_current_players(players_in_room)

	async def disconnect(self, close_code):
		user = self.scope['user']
		await self.remove_player_from_room(user.username)
		players_in_room = await self.get_players_in_room()

		if players_in_room:
			await self.send_current_players(players_in_room)

		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)


	async def receive(self, text_data):
		try:
			data = json.loads(text_data)
			action = data['action']
			state = data['state']
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'game_action',
					'action': action,
					'state': state
				}
			)

		except KeyError:
			await self.send(text_data=json.dumps({'error': 'Invalid data received'}))
		except Exception as e:
			await self.send(text_data=json.dumps({'error': str(e)}))


	async def player_action(self, event):
		action = event['action']
		players = event['players']

		await self.send(text_data=json.dumps({
			'action': action,
			'players': players
		}))

	async def game_action(self, event):
		action = event['action']
		state = event['state']

		await self.send(text_data=json.dumps({
			'action': action,
			'state': state
		}))
	

	async def add_player_to_room(self, player_name):
		redis = await aioredis.from_url("redis://redis:6379")
		await redis.rpush(self.redis_key, player_name)
		await redis.close()

	async def get_players_in_room(self):
		redis = await aioredis.from_url("redis://redis:6379")
		players = await redis.lrange(self.redis_key, 0, -1)
		await redis.close()
		return players

	async def remove_player_from_room(self, player_name):
		redis = await aioredis.from_url("redis://redis:6379")
		logger.warning(player_name)
		await redis.lrem(self.redis_key, 0, player_name)
		players = await redis.lrange(self.redis_key, 0, -1)
		logger.warning(players)
		if not players:
			await redis.delete(self.redis_key)
		await redis.close()
	
	async def get_user_profiles(self, player_usernames):
		player_usernames = [username.decode('utf-8') if isinstance(username, bytes) else username for username in player_usernames]
		user_profiles = await database_sync_to_async(lambda: list(UserProfile.objects.filter(username__in=player_usernames)))()
		serializer = UserProfileSerializer(user_profiles, many=True)
		return serializer.data

	async def send_current_players(self, players):
		user_profiles = await self.get_user_profiles(players)
		await self.channel_layer.group_send(
			self.room_group_name,
            {
				'type': 'player_action',
				'action': 'current_players',
				'players': user_profiles
			}
		)