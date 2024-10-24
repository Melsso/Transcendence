from channels.generic.websocket import AsyncWebsocketConsumer
from channels_redis.core import RedisChannelLayer

import json
import asyncio
from django.conf import settings
from users.models import UserProfile
from .models import PongGame, RrGame, Game


class GameConsumer(AsyncWebsocketConsumer):
	redis_room_prefix = 'game_room_'
	async def connect(self):
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		self.room_group_name = f'game_{self.room_name}'
		self.redis_key = self.redis_room_prefix + self.room_group_name
		players_in_room = await self.get_players_in_room()
		if len(players_in_room) >= 2:
			await self.close()
			return 
		await self.add_player_to_room(self.channel_name)
		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		await self.accept()

	async def disconnect(self, close_code):
		await self.remove_player_from_room(self.channel_name)
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)


	async def receive(self, text_data):
		try:
			data = json.loads(text_data)
			action = data['action']
			player = data['player']
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'game_action',
					'action': action,
					'player': player
				}
			)

		except KeyError:
			await self.send(text_data=json.dumps({'error': 'Invalid data received'}))
		except Exception as e:
			await self.send(text_data=json.dumps({'error': str(e)}))


	async def game_action(self, event):
		action = event['action']
		player = event['player']

		await self.send(text_data=json.dumps({
			'action': action,
			'player': player
		}))
	
	async def get_players_in_room(self):
		redis = self.channel_layer._redis_connection(self.channel_layer.consistent_hash(self.room_group_name))
		players = await redis.lrange(self.redis_key, 0, -1)
		return players

	async def add_player_to_room(self, player_name):
		redis = self.channel_layer._redis_connection(self.channel_layer.consistent_hash(self.room_group_name))
		await redis.rpush(self.redis_key, player_name)
	
	async def remove_player_from_room(self, player_name):
		redis = self.channel_layer._redis_connection(self.channel_layer.consistent_hash(self.room_group_name))
		await redis.lrem(self.redis_key, 0, player_name)
		players = await redis.lrange(self.redis_key, 0, -1)
		if not players:
			await redis.delete(self.redis_key)