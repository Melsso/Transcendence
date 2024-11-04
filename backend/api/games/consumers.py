from channels.generic.websocket import AsyncWebsocketConsumer
from channels_redis.core import RedisChannelLayer
import aioredis
import json
import math
import logging
import asyncio
from channels.db import database_sync_to_async
from users.models import UserProfile
from users.serializers import UserProfileSerializer
from urllib.parse import parse_qs

logger = logging.getLogger(__name__)
REFERENCE_WIDTH = 1920
REFERENCE_HEIGHT = 1080
class GameConsumer(AsyncWebsocketConsumer):
	redis_room_prefix = 'game_room_'
	ball = {
		'x': 0.5, 
		'y': 0.5,  
		'dx': 0.005,
		'dy': 0.005,
		'radius': 0.01 
	}
	paddle1 = {'y': 0.45,'height': 0.1, 'width':0.01, 'dy': 0.01}
	paddle2 = {'y': 0.45,'height': 0.1, 'width':0.01, 'dy': 0.01}

	# async def queueCreation(self):

	async def connect(self):
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		# if "queue_" in self.room_name:
		# 	queueCreation(self)
		# 	return
		self.room_group_name = f'{self.room_name}'
		user = self.scope['user']
		if user.is_anonymous:
			await self.close()

		self.redis_key = self.redis_room_prefix + self.room_group_name
		query_string = self.scope['query_string'].decode('utf-8')
		query_params = parse_qs(query_string)
		
		screen_width = query_params.get('width', [None])[0]
		screen_height = query_params.get('height', [None])[0]
		if screen_width and screen_height:
			screen_width = int(screen_width)
			screen_height = int(screen_height)

		players_in_room = await self.get_players_in_room()
		if len(players_in_room) >= 2:
			await self.close()
			return 
		
		await self.add_player_to_room(user.username, screen_width, screen_height)
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
			target = data.get('target') 
			player = data.get('player')
			if action == 'update_game_state':
				if player == '1':
					if state == 1:
						if self.paddle1['y'] > 0:
							self.paddle1['y'] -= self.paddle1['dy']
							if self.paddle1['y'] < 0:
								self.paddle1['y'] = 0
					else:
						if self.paddle1['y'] < 1 - self.paddle1['height']: 
							self.paddle1['y'] += self.paddle1['dy']
							if self.paddle1['y'] > 0.9:
								self.paddle1['y'] = 0.9
					await self.channel_layer.group_send(
						self.room_group_name,
						{
							'type': 'game_action',
							'action': action,
							'state': self.paddle1['y'],
							'target': target
						}
					)
				else:
					if state == 1:
						if self.paddle2['y'] > 0: 
							self.paddle2['y'] -= self.paddle2['dy']
							if self.paddle2['y'] < 0:
								self.paddle2['y'] = 0
					else:
						if self.paddle2['y'] < 1 - self.paddle2['height']: 
							self.paddle2['y'] += self.paddle2['dy']
							if self.paddle2['y'] > 0.9:
								self.paddle2['y'] = 0.9							
					await self.channel_layer.group_send(
						self.room_group_name,
						{
							'type': 'game_action',
							'action': action,
							'state': self.paddle2['y'],
							'target': target
						}
					)
			elif action == 'player_action':
				username = state['username']
				ready_status = state['ready']
				await self.update_player_ready(username, ready_status)
				players_in_room = await self.get_players_in_room()
				await self.send_current_players(players_in_room)
				start = True
				if len(players_in_room) != 2:
					return 
				for player in players_in_room:
					if players_in_room[player]['ready'] == False:
						start = False
						break
				if start == True:
					self.game_loop = asyncio.create_task(self.move_ball())
			
		except KeyError:
			await self.send(text_data=json.dumps({'error': 'Invalid data received'}))
		except Exception as e:
			await self.send(text_data=json.dumps({'error': str(e)}))

	async def move_ball(self):
		# WAIT FOR THE ROUND TO START
		normal_intersect_y = 0
		angle = 0
		ball_hits = 0
		speed = 0.005
		await asyncio.sleep(3)
		while True:
			# BALL INCREMENTS
			if ball_hits == 8:
				ball_hits = 0
				speed += 0.00125

			self.ball['x'] += self.ball['dx']
			self.ball['y'] += self.ball['dy']
			# LETS FIRST DEFINE OUR LOSING CONS
			if self.ball['x'] <= 0.01:
				self.ball['x'] = 0.5
				self.ball['y'] = 0.5
			if self.ball['x'] >= 0.99:
				self.ball['x'] = 0.5
				self.ball['y'] = 0.5

			# NEXT LETS HANDLE WALL BOUNCES
			if self.ball['y'] <= 0.06:
				self.ball['dy'] = -self.ball['dy']
			if self.ball['y'] >= 0.99:
				self.ball['dy'] = -self.ball['dy']

			# FINALLY WE DEFINE PADDLE BOUNCE
			if self.ball['x'] <= 0.02 and self.ball['y'] >= self.paddle1['y'] and self.ball['y'] <= self.paddle1['y'] + 0.11:
				ball_hits += 1
				normal_intersect_y = (self.paddle1['y'] + 0.05 - self.ball['y']) / 0.05
				angle =  math.radians(normal_intersect_y * 75)
				# self.ball['dx'] = abs(self.ball['dx']) * math.cos(angle) + math.copysign(speed, self.ball['dx'])
				# self.ball['dy'] = -abs(self.ball['dy']) * math.sin(angle) + math.copysign(speed, self.ball['dy'])

				self.ball['dx'] = abs(self.ball['dx']) * math.cos(angle)
				self.ball['dy'] = -abs(self.ball['dy']) * math.sin(angle)

			if self.ball['x'] >= 0.98 and self.ball['y'] >= self.paddle2['y'] and self.ball['y'] <= self.paddle2['y'] + 0.11:
				ball_hits += 1
				normal_intersect_y = (self.paddle2['y'] + 0.05 - self.ball['y']) / 0.05
				angle = math.radians(normal_intersect_y * 75)
				# self.ball['dx'] = -abs(self.ball['dx']) * math.cos(angle) + math.copysign(speed, self.ball['dx'])
				# self.ball['dy'] = -abs(self.ball['dy']) * math.sin(angle) + math.copysign(speed, self.ball['dy'])

				self.ball['dx'] = -abs(self.ball['dx']) * math.cos(angle)
				self.ball['dy'] = -abs(self.ball['dy']) * math.sin(angle)

			# BROADCAST BALL POSITION
			await self.channel_layer.group_send(
			self.room_group_name,
				{
					"type": 'ball_position',
					"action": 'ball_movment',
					"x": self.ball['x'],
					"y": self.ball['y']
				}
			)
			# SIMULATE FRAMERATE
			await asyncio.sleep(0.016)

	async def ball_position(self, event):
		action = event['action']
		await self.send(text_data=json.dumps({
            "type": "ballState",
			'action': action,
            "x": event["x"],
            "y": event["y"]
        }))

	async def player_action(self, event):
		action = event['action']
		players = event['players']
		if players:
			await self.send(text_data=json.dumps({
				'action': action,
				'players': players
			}))

	async def game_action(self, event):
		action = event['action']
		state = event['state']
		logger.warning(state);
		target = event.get('target')
		await self.send(text_data=json.dumps({
			'action': action,
			'state': state,
			'target': target
		}))
	

	async def add_player_to_room(self, player_name, screen_width, screen_height):
		redis = await aioredis.from_url("redis://redis:6379")
		player_data = {
			"username": player_name,
			"ready": False,
			"screen_dimensions": {
				"width": screen_width,
				"height": screen_height
			}
		}
		await redis.hset(self.redis_key, player_name, json.dumps(player_data))
		await redis.close()

	async def get_players_in_room(self):
		redis = await aioredis.from_url("redis://redis:6379")
		players_dict = await redis.hgetall(self.redis_key)
		await redis.close()
		players = {
        	k.decode('utf-8'): json.loads(v) if isinstance(v, bytes) else v 
        	for k, v in players_dict.items()
    	}
		return players

	async def remove_player_from_room(self, player_name):
		redis = await aioredis.from_url("redis://redis:6379")
		await redis.hdel(self.redis_key, player_name)
		players = await redis.hgetall(self.redis_key)
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
		ready_status = {username: data['ready'] for username, data in players.items()}
		screen_dimensions = {username: data.get('screen_dimensions', {}) for username, data in players.items()}

		for profile in user_profiles:
			profile['ready'] = ready_status.get(profile['username'], False)
			profile['screen_dimensions'] = screen_dimensions.get(profile['username'], {"width": None, "height": None})

		await self.channel_layer.group_send(
			self.room_group_name,
            {
				'type': 'player_action',
				'action': 'current_players',
				'players': user_profiles
			}
		)

class TournamentConsumer(AsyncWebsocketConsumer):
	redis_room_prefix = 'tournament_room_'
	async def connect(self):
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		self.room_group_name = f'{self.room_name}'
		user = self.scope['user']
		if user.is_anonymous:
			await self.close()

		self.redis_key = self.redis_room_prefix + self.room_group_name
		query_string = self.scope['query_string'].decode('utf-8')
		query_params = parse_qs(query_string)
		
		screen_width = query_params.get('width', [None])[0]
		screen_height = query_params.get('height', [None])[0]
		if screen_width and screen_height:
			screen_width = int(screen_width)
			screen_height = int(screen_height)

		players_in_room = await self.get_players_in_room()
		if len(players_in_room) >= 8:
			await self.close()
			return 
		
		await self.add_player_to_room(user.username, screen_width, screen_height)
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
				username = state['username']
				ready_status = state['ready']
				await self.update_player_ready(username, ready_status)
				players_in_room = await self.get_players_in_room()
				await self.send_current_players(players_in_room)
			
		except KeyError:
			await self.send(text_data=json.dumps({'error': 'Invalid data received'}))
		except Exception as e:
			await self.send(text_data=json.dumps({'error': str(e)}))


	async def player_action(self, event):
		action = event['action']
		players = event['players']
		if players:
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
	

	async def add_player_to_room(self, player_name, screen_width, screen_height):
		redis = await aioredis.from_url("redis://redis:6379")
		player_data = {
			"username": player_name,
			"ready": False,
			"screen_dimensions": {
				"width": screen_width,
				"height": screen_height
			}
		}
		await redis.hset(self.redis_key, player_name, json.dumps(player_data))
		await redis.close()

	async def get_players_in_room(self):
		redis = await aioredis.from_url("redis://redis:6379")
		players_dict = await redis.hgetall(self.redis_key)
		await redis.close()
		players = {
        	k.decode('utf-8'): json.loads(v) if isinstance(v, bytes) else v 
        	for k, v in players_dict.items()
    	}
		logger.warning(players)
		return players

	async def remove_player_from_room(self, player_name):
		redis = await aioredis.from_url("redis://redis:6379")
		await redis.hdel(self.redis_key, player_name)
		players = await redis.hgetall(self.redis_key)
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
		ready_status = {username: data['ready'] for username, data in players.items()}
		screen_dimensions = {username: data.get('screen_dimensions', {}) for username, data in players.items()}

		for profile in user_profiles:
			profile['ready'] = ready_status.get(profile['username'], False)
			profile['screen_dimensions'] = screen_dimensions.get(profile['username'], {"width": None, "height": None})

		logger.warning(user_profiles)
		await self.channel_layer.group_send(
			self.room_group_name,
            {
				'type': 'player_action',
				'action': 'current_players',
				'players': user_profiles
			}
		)