from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from users.models import UserProfile
from users.serializers import UserProfileSerializer
from urllib.parse import parse_qs
import aioredis
import json
import random
import uuid
import string
import logging
import asyncio
import time

logger = logging.getLogger(__name__)
class GameConsumer(AsyncWebsocketConsumer):
	redis_room_prefix = 'game_room_'
	game_rooms = {}

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
			"ready": "UNDECIDED",
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
		paddle1 = {'y': 0.45,'height': 0.1, 'width':0.01, 'dy': 0.01, 'attack': 0, 'score': 0}
		paddle2 = {'y': 0.45,'height': 0.1, 'width':0.01, 'dy': 0.01, 'attack': 0, 'score': 0}
		ball = { 'x': 0.5, 'y': 0.5, 'dx': 0.005, 'dy': 0.005, 'radius': 0.0}
		self.game_rooms[self.room_group_name] = {"paddle1": paddle1, "paddle2": paddle2, "ball": ball}
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
		
	async def tournamentManager(self):
		self.room_group_name = f'{self.room_name}'
		user = self.scope['user']
		if user.is_anonymous:
			await self.close()
		self.redis_key = self.redis_room_prefix + self.room_group_name
		await self.add_player_to_queue_room(user.username)
		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		await self.accept()
		players_in_room = await self.get_players_in_room()
		if len(players_in_room) == 1:
			paddle1 = {'y': 0.45,'height': 0.1, 'width':0.01, 'dy': 0.01, 'attack': 0, 'score': 0}
			paddle2 = {'y': 0.45,'height': 0.1, 'width':0.01, 'dy': 0.01, 'attack': 0, 'score': 0}
			ball = { 'x': 0.5, 'y': 0.5, 'dx': 0.005, 'dy': 0.005, 'radius': 0.0}
			self.game_rooms[self.room_group_name] = {"paddle1": paddle1, "paddle2": paddle2, "ball": ball}
		elif len(players_in_room) == 2:
			task = asyncio.create_task(self.move_ball(self.room_group_name))
			self.game_rooms[self.room_group_name]["task"] = task

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
			self.redis_key = room_name
			await self.remove_player_from_room(user.username)
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
			await self.matchPlayersWithClosestExp(user)

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
		if "tournoi_" in self.room_name:
			await self.tournamentManager()
			return
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
		if len(players_in_room) == 1:
			paddle1 = {'y': 0.45,'height': 0.1, 'width':0.01, 'dy': 0.01, 'attack': 0, 'score': 0}
			paddle2 = {'y': 0.45,'height': 0.1, 'width':0.01, 'dy': 0.01, 'attack': 0, 'score': 0}
			ball = { 'x': 0.5, 'y': 0.5, 'dx': 0.005, 'dy': 0.005, 'radius': 0.0}
			self.game_rooms[self.room_group_name] = {"paddle1": paddle1, "paddle2": paddle2, "ball": ball}
		await self.send_current_players(players_in_room)

	async def disconnect(self, close_code):
		user = self.scope['user']
		if self.room_group_name in self.game_rooms:
			if 'task' in self.game_rooms[self.room_group_name]:
				task = self.game_rooms[self.room_group_name]['task']
				if not task.done():
					task.cancel()
				try:
					await task  
				except asyncio.CancelledError:
					pass
				finally:
					if 'task' in self.game_rooms[self.room_group_name]:
						del self.game_rooms[self.room_group_name]['task']
		await self.remove_player_from_room(user.username)
		players_in_room = await self.get_players_in_room()

		if len(players_in_room) == 0:
			del self.game_rooms[self.room_group_name]
		elif players_in_room and 'queue_' not in self.room_group_name:
			await self.send_current_players(players_in_room)
		elif len(players_in_room) == 1 and 'queue' in self.room_group_name:
			await self.send_currents(players_in_room)
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
			buff = data.get('buff')
			key = self.room_group_name
			game = self.game_rooms[key]
			if action == 'update_game_state':
				if player == '1':
					if state == 1:
						if game['paddle1']['y'] > 0.05:
							game['paddle1']['y'] -= game['paddle1']['dy']
							if game['paddle1']['y'] < 0.05:
								game['paddle1']['y'] = 0.05
					else:
						if game['paddle1']['y'] < 1 - game['paddle1']['height']: 
							game['paddle1']['y'] += game['paddle1']['dy']
							if game['paddle1']['y'] >= (1 - game['paddle1']['height']):
								game['paddle1']['y'] = (1 - game['paddle1']['height'])
					await self.channel_layer.group_send(
						self.room_group_name,
						{
							'type': 'game_action',
							'action': action,
							'state': game['paddle1']['y'],
							'target': target
						}
					)
				else:
					if state == 1:
						if game['paddle2']['y'] > 0.05: 
							game['paddle2']['y'] -= game['paddle2']['dy']
							if game['paddle2']['y'] < 0.05:
								game['paddle2']['y'] = 0.05
					else:
						if game['paddle2']['y'] < 1 - game['paddle2']['height']: 
							game['paddle2']['y'] += game['paddle2']['dy']
							if game['paddle2']['y'] >= (1 - game['paddle2']['height']):
								game['paddle2']['y'] = (1 - game['paddle2']['height'])							
					await self.channel_layer.group_send(
						self.room_group_name,
						{
							'type': 'game_action',
							'action': action,
							'state': game['paddle2']['y'],
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
					task = asyncio.create_task(self.move_ball(self.room_group_name))
					self.game_rooms[self.room_group_name]["task"] = task
			elif action == 'queue_status':
				await self.update_player_ready(player, state)
				players_in_room = await self.get_players_in_room()
				players_keys = list(players_in_room.keys())
				if len(players_in_room) != 2:
					return
				start = True
				user = self.scope['user']
				for player in players_in_room:
					if players_in_room[player]['ready'] == "UNDECIDED":
						start = False
						continue
					elif players_in_room[player]['ready'] == False:
						start = False
						self.remove_player_from_room(player)
						players_in_room = await self.get_players_in_room()
						return
				if start == True:
					players_in_room = await self.get_players_in_room()
					await self.send_currents(players_in_room)

			elif action == 'game_start':
				task = asyncio.create_task(self.move_ball(self.room_group_name))
				self.game_rooms[self.room_group_name]["task"] = task
			elif action == 'update_buff_state':
				if player == 1:
					if buff == 'speed':
						game['paddle1']['dy'] = 0.0175
					elif buff == 'shield':
						if game['paddle1']['height'] <= 0.1:
							game['paddle1']['y'] = game['paddle1']['y'] - (game['paddle1']['height'] / 2)
							game['paddle1']['height'] = game['paddle1']['height'] * 2
					elif buff == 'attack_hit':
						game['paddle1']['y'] = game['paddle1']['y'] + (game['paddle1']['height'] / 4)
						game['paddle1']['height'] = game['paddle1']['height'] / 2
					await self.channel_layer.group_send(
						self.room_group_name,
						{
							'type': 'game_action',
							'action': action,
							'state': buff,
							'target': player
						}
					)
				else:
					if buff == 'speed':
						game['paddle2']['dy'] = 0.0175
					elif buff == 'shield':
						if game['paddle2']['height'] <= 0.1:
							game['paddle2']['y'] = game['paddle2']['y'] - (game['paddle2']['height'] / 2)
							game['paddle2']['height'] = game['paddle2']['height'] * 2
					elif buff == 'attack_hit':
						game['paddle2']['y'] = game['paddle2']['y'] + (game['paddle2']['height'] / 4)
						game['paddle2']['height'] = game['paddle2']['height'] / 2
					await self.channel_layer.group_send(
						self.room_group_name,
						{
							'type': 'game_action',
							'action': action,
							'state': buff,
							'target': player
						}
					)
			
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
					task = asyncio.create_task(self.move_ball(self.room_group_name))
					self.game_rooms[self.room_group_name]["task"] = task
		elif len(players) == 2:
			p1 = players[player_keys[0]]
			if p1['ready'] == True:
				self.queueManager()
		else:
			# here delete the asgi key and this room and whatever else, this shouldnt be reached anyway
			pass


	async def move_ball(self, key):
		game = self.game_rooms[key]
		game['ball'] = {'x': 0.5, 'y': 0.5,  'dx': 0.005,'dy': 0.005,'radius': 0.01 }
		game['paddle1'] = {'y': 0.45,'height': 0.1, 'width':0.01, 'dy': 0.01, 'attack': 0, 'score': 0}
		game['paddle2'] = {'y': 0.45,'height': 0.1, 'width':0.01, 'dy': 0.01, 'attack': 0, 'score': 0}
		angleX = 1
		angleY = 0
		buff1= 0
		buff2 = 0
		buff3 = 0
		howmanyspeeds = 0
		speed = 0.0005
		last_hit = None
		await asyncio.sleep(3.5)
		new_start = time.time()
		while True:
			base_speed = 0.005 + (speed * howmanyspeeds)
			current_time = time.time()
			if current_time - new_start >= 8:
				if howmanyspeeds < 5:
					howmanyspeeds += 1
			game['ball']['dx'] = angleX * base_speed
			game['ball']['dy'] = angleY * base_speed
			game['ball']['x'] += game['ball']['dx']
			game['ball']['y'] += game['ball']['dy']
			if current_time - new_start >= 13 and buff1 == 0:
				buff1 = 1
				await self.channel_layer.group_send(
				self.room_group_name,
					{
						"type": 'demandPowerUP',
						"action": 'Buff',
						"flag": 1
					}
				)
			if current_time - new_start >= 3 and buff2 == 0:
				buff2 = 1
				await self.channel_layer.group_send(
				self.room_group_name,
					{
						"type": 'demandPowerUP',
						"action": 'Buff',
						"flag": 2
					}
				)
			if current_time - new_start >= 23 and buff3 == 0:
				buff3 = 1
				await self.channel_layer.group_send(
				self.room_group_name,
					{
						"type": 'demandPowerUP',
						"action": 'Buff',
						"flag": 3
					}
				)
			if game['ball']['y'] <= 0.06 or game['ball']['y'] >= 0.99:
				angleY = -angleY
			elif game['ball']['x'] <= 0.02 and game['paddle1']['y'] <= game['ball']['y'] <= game['paddle1']['y'] + 0.11:
				angleX = abs(angleX)
				impact_point = (game['ball']['y'] - game['paddle1']['y']) / game['paddle1']['height']
				angleY = (impact_point - 0.5) * 2
				last_hit = 1
				await self.channel_layer.group_send(
				self.room_group_name,
					{
						"type": 'paddle_hit',
						"action": 'paddle_hit',
						"paddle": last_hit,
					}
				)
			elif game['ball']['x'] >= 0.98 and game['paddle2']['y'] <= game['ball']['y'] <= game['paddle2']['y'] + 0.11:
				angleX = -abs(angleX)
				impact_point = (game['ball']['y'] - game['paddle2']['y']) / game['paddle2']['height']
				angleY = (impact_point - 0.5) * 2
				last_hit = 2
				await self.channel_layer.group_send(
				self.room_group_name,
					{
						"type": 'paddle_hit',
						"action": 'paddle_hit',
						"paddle": last_hit,
					}
				)
			elif game['ball']['x'] <= 0.01 or game['ball']['x'] >= 0.99:
				if game['ball']['x'] <= 0.01:
					game['paddle2']['score'] += 1
				else:
					game['paddle1']['score'] += 1
				
				if game['paddle1']['score'] == 7 or game['paddle2']['score'] == 7:
					await self.channel_layer.group_send(
					self.room_group_name,
						{
							"type": 'r_round',
							"action": 'restart_round',
							"state": 'end',
						}
					)
					break
				
				game['ball']['x'] = 0.5
				game['ball']['y'] = 0.5
				game['ball']['dx'] = 0.005
				game['ball']['dy'] = 0.005
				game['paddle1']['y'] = 0.45
				game['paddle2']['y'] = 0.45
				howmanyspeeds = 0
				base_speed = 0.005
				angleX = 1
				angleY = 0
				buff1 = 0
				buff2 = 0
				buff3 = 0
				await self.channel_layer.group_send(
				self.room_group_name,
					{
						"type": 'r_round',
						"action": 'restart_round',
						"state": 'restart',
					}
				)
				await asyncio.sleep(4)
				new_start = time.time()
				continue
			await self.channel_layer.group_send(
			self.room_group_name,
				{
					"type": 'ball_position',
					"action": 'ball_movment',
					"x": game['ball']['x'],
					"y": game['ball']['y']
				}
			)
			await asyncio.sleep(0.032)

	async def empty_action(self, event):
		action = event['action']
		await self.send(text_data=json.dumps({
			'action': action,
		}))

	async def demandPowerUP(self, event):
		action = event['action']
		flag = event['flag']
		await self.send(text_data=json.dumps({
         'flag': flag,
			'action': action,
        }))
	async def r_round(self, event):
		action = event['action']
		state = event['state']
		await self.send(text_data=json.dumps({
         "type": "restart_round",
			'action': action,
			"state": state,
        }))
	async def maybe(self):
		await self.channel_layer.group_send(
		self.room_group_name,
			{
				"type": 'r_round',
				"action": 'restart_round',
				"state": 'end',
			}
		)


	async def ball_position(self, event):
		action = event['action']
		await self.send(text_data=json.dumps({
            "type": "ballState",
				'action': action,
            "x": event["x"],
            "y": event["y"]
        }))

	async def paddle_hit(self, event):
		action = event['action']
		paddle = event['paddle']
		await self.send(text_data=json.dumps({
				'action': action,
				'paddle': paddle
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
		target = event['target']
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

	async def queue_action(self, event):
		action = event['action']
		players = event['players']
		settings = event['settings']
		room_name = event['room_name']

		await self.send(text_data=json.dumps({
			'action': action,
			'players': players,
			'settings': settings,
			'room_name': room_name
		}))
	
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
	
	async def send_currents(self, players):
		user_profiles = await self.get_user_profiles(players)
		ready_status = {username: data['ready'] for username, data in players.items()}
		for profile in user_profiles:
			profile['ready'] = ready_status.get(profile['username'], False)
		if len(user_profiles) == 1:
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'queue_action',
					'action': 'queue_start_game',
					'players': user_profiles,
					'settings': None,
					'room_name': None
				}
			)
			return
		uid1 = user_profiles[0]['id']
		uid2 = user_profiles[1]['id']
		timestamp_part = str(int(time.time()))[-6:]
		random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
		room_name = f"{uid1}_{uid2}_{timestamp_part}_{random_part}"
		settings = {
			"mode": random.choice(['Default Mode', 'Buff Mode']),
			"map": random.choice(['Map 1', 'Map 2', 'Map 3'])
		}
		await self.channel_layer.group_send(
			self.room_group_name,
            {
				'type': 'queue_action',
				'action': 'queue_start_game',
				'players': user_profiles,
				'settings': settings,
				'room_name': room_name,
			}
		)
