from channels.generic.websocket import AsyncWebsocketConsumer
from channels_redis.core import RedisChannelLayer
import aioredis
import json
import math
import logging
import asyncio
import time
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

	async def get_all_rooms(self):
		redis = await aioredis.from_url("redis://redis:6379")
		cursor = b'0'
		rooms = {}
		while cursor:
			cursor, keys = await redis.scan(cursor=cursor, match='game_room_queue_*')
			for key in keys:
				players_dict = await redis.hgetall(key)
				players = {
                    k.decode('utf-8'): json.loads(v) if isinstance(v, bytes) else v 
                    for k, v in players_dict.items()
                }
				player_usernames = [player_data['username'] for player_data in players.values()]
				player_usernames = [username.decode('utf-8') if isinstance(username, bytes) else username for username in player_usernames]
				user_profiles = await database_sync_to_async(lambda: list(UserProfile.objects.filter(username__in=player_usernames)))()
				rooms[key.decode('utf-8')] = user_profiles
		await redis.close()
		return rooms

	def find_match_room(self, user, rooms):
		exp = user.bar_exp_game1 / 1000
		for room_name, players_profile in rooms.items():
			if len(players_profile) == 2:
				continue	
			for player_profile in players_profile:
				if player_profile.bar_exp_game1 / 1000 >= exp-1 and player_profile.bar_exp_game1 / 1000 <= exp+1:
					return room_name
		return None
	
	async def add_player_to_queue_room(self, player_name):
		redis = await aioredis.from_url("redis://redis:6379")
		player_data = {
			"username": player_name,
			"ready": False,
		}
		await redis.hset(self.redis_key, player_name, json.dumps(player_data))
		await redis.close()


	async def create_queue_room(self, player_name):
		self.room_group_name = f'{self.room_name}'
		self.redis_key = self.redis_room_prefix + self.room_group_name
		await self.add_player_to_queue_room(player_name)
		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		await self.accept()

	async def notifyPlayers(self):
		rooms = await self.get_all_rooms()
		players = rooms[self.redis_key]
		serializer = UserProfileSerializer(players, many=True)
		await self.channel_layer.group_send(
			self.room_group_name,
            {
				'type': 'player_action',
				'action': 'notify_match',
				'players': serializer.data
			}
		)

	async def matchPlayersWithClosestExp(self, user):
		await asyncio.sleep(10)
		current_players = await self.get_players_in_room()
		if len(current_players) >= 2:
			return
		rooms = await self.get_all_rooms()
		exp = user.bar_exp_game1 / 1000
		closest_room = None
		min_exp_diff = float('inf')
		for room_name, players_profile in rooms.items():
			if len(players_profile) == 2:
				continue
			if room_name == self.redis_key:
				continue
			for player_profile in players_profile:
				player_exp = player_profile.bar_exp_game1 / 1000
				exp_diff = abs(player_exp - exp)
				if exp_diff < min_exp_diff:
					min_exp_diff = exp_diff
					closest_room = room_name
		if closest_room:
			await self.remove_player_from_room(user.username)
			self.redis_key = room_name
			await self.add_player_to_queue_room(user.username)
			self.room_group_name = room_name.replace("game_room_", "")
			await self.channel_layer.group_add(
				self.room_group_name,
				self.channel_name
			)
			await self.notifyPlayers()
		else:
			await self.channel_layer.group_send(
				self.room_group_name,
            	{
					'type': 'empty_action',
					'action': 'no_match',
				}
			)

	async def queueManager(self):
		rooms = await self.get_all_rooms()
		user = self.scope['user']
		if user.is_anonymous:
			await self.close()
		room_name = self.find_match_room(user, rooms)
		if room_name is None:
			await self.create_queue_room(user.username)
			rooms = await self.get_all_rooms()
			self.checker_loop = asyncio.create_task(self.matchPlayersWithClosestExp(user))
		else:
			self.redis_key = room_name
			await self.add_player_to_queue_room(user.username)
			self.room_group_name = room_name.replace("game_room_", "")
			await self.channel_layer.group_add(
				self.room_group_name,
				self.channel_name
			)
			await self.accept()
			await self.notifyPlayers()
		
		return
	
	async def connect(self):
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		if "queue_" in self.room_name:
			await self.queueManager()
			return
		self.room_group_name = f'{self.room_name}'
		user = self.scope['user']
		if user.is_anonymous:
			await self.close()

		self.redis_key = self.redis_room_prefix + self.room_group_name
		# delete this chunk
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
		if hasattr(self, 'game_loop') and not self.game_loop.done():
			self.game_loop.cancel()
			try:
				await self.game_loop
			except asyncio.CancelledError:
				pass
		user = self.scope['user']
		await self.remove_player_from_room(user.username)
		if "queue_" in self.redis_key:
			return
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
			action = data.get('action')
			state = data.get('state')
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
				players_keys = list(players_in_room.keys())
				user = self.scope['user']
				await self.send_current_players(players_in_room)
				start = True
				if len(players_in_room) != 2:
					return 
				for player in players_in_room:
					if players_in_room[player]['ready'] == False:
						start = False
						break
				if start == True:
					if user.username == players_keys[0]:
						self.game_loop = asyncio.create_task(self.move_ball())
			elif action == 'queue_status':
				if state == False:
					await self.remove_player_from_room(player)
				else:
					await self.update_player_ready(player, state)
			elif action == 'game_start':
				await self.gameStart()
		except KeyError:
			await self.send(text_data=json.dumps({'error': 'Invalid data received'}))
		except Exception as e:
			await self.send(text_data=json.dumps({'error': str(e)}))

	async def gameStart(self):
		redis = await aioredis.from_url("redis://redis:6379")
		players_dict = await redis.hgetall(self.redis_key)
		user = self.scope['user']
		await redis.close()
		players = {
        	k.decode('utf-8'): json.loads(v) if isinstance(v, bytes) else v 
        	for k, v in players_dict.items()
    	}
		player_keys = list(players.keys())

		if len(players) == 2:
			p1 = players[player_keys[0]]
			p2 = players[player_keys[1]]
			if p1['ready'] == True and p2['ready'] == True:
				if user.username == player_keys[0]:
					user_profiles = await database_sync_to_async(lambda: list(UserProfile.objects.filter(username__in=player_keys)))()
					serializer = UserProfileSerializer(user_profiles, many=True)
					await self.channel_layer.group_send(
						self.room_group_name, {
							'type': 'player_action',
							'action': 'start_queue_game',
							'players': serializer.data
						}
					)
					self.game_loop = asyncio.create_task(self.move_ball())
		elif len(players) == 2:
			p1 = players[player_keys[0]]
			if p1['ready'] == True:
				self.queueManager()
		else:
			# here delete the asgi key and this room and whatever else, this shouldnt be reached anyway
			pass


	async def move_ball(self):
		angleX = 1 
		angleY = 0
		ball_hits = 0
		howmanyspeeds = 0
		speed = 0.00125
		base_speed = 0.005 + (speed * howmanyspeeds)
		await asyncio.sleep(3)

		start_time = time.time()
		new_start = start_time

		while True:
			current_time = time.time()
			if current_time - new_start >= 5:
				howmanyspeeds += 1
				new_start = current_time
				base_speed += speed

			self.ball['dx'] = angleX * base_speed
			self.ball['dy'] = angleY * base_speed
			self.ball['x'] += self.ball['dx']
			self.ball['y'] += self.ball['dy']
			if self.ball['x'] <= 0.01 or self.ball['x'] >= 0.99:
				self.ball['x'] = 0.5
				self.ball['y'] = 0.5
				self.ball['dx'] = 0.005
				self.ball['dy'] = 0.005
				angleX = -angleX
			if self.ball['y'] <= 0.06 or self.ball['y'] >= 0.99:
				angleY = -angleY
			if self.ball['x'] <= 0.02 and self.paddle1['y'] <= self.ball['y'] <= self.paddle1['y'] + 0.11:
				angleX = abs(angleX)
				impact_point = (self.ball['y'] - self.paddle1['y']) / self.paddle1['height']
				angleY = (impact_point - 0.5) * 2

			elif self.ball['x'] >= 0.98 and self.paddle2['y'] <= self.ball['y'] <= self.paddle2['y'] + 0.11:
				angleX = -abs(angleX)
				impact_point = (self.ball['y'] - self.paddle2['y']) / self.paddle2['height']
				angleY = (impact_point - 0.5) * 2
			await self.channel_layer.group_send(
			self.room_group_name,
				{
					"type": 'ball_position',
					"action": 'ball_movment',
					"x": self.ball['x'],
					"y": self.ball['y']
				}
			)
			await asyncio.sleep(0.016)

	async def empty_action(self, event):
		action = event['action']
		await self.send(text_data=json.dumps({
			'action': action,
		}))

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
			await self.channel_layer.group_discard(
				self.room_group_name, self.channel_name
			)
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