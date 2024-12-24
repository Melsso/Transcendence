from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from games.models import PongGame
import random
import string
import time

UserProfile = get_user_model()

class Command(BaseCommand):
    help = 'Create a special AI user'

    def handle(self, *args, **kwargs):
        self.create_users()
        self.create_game_records()

    def create_users(self):
        users = [
            {
                'username': 'Deleted_User',
                'password': 'strongpass123',
                'email': 'deleted@my_pong_website.com',
                'bar_exp_game1': 56120,
                'is_verified': True,
                'is_active': True,
                't_won':    0
            },
            {
                'username': 'Easy AI',
                'password': 'strongpass123',
                'email': 'easai@my_pong_website.com',
                'bar_exp_game1': 1000,
                'is_verified': True,
                'is_active': True,
                't_won':    0
            },
            {
                'username': 'Hard AI',
                'password': 'strongpass123',
                'email': 'harai@my_pong_website.com',
                'bar_exp_game1': 50000,
                'is_verified': True,
                'is_active': True,
                't_won':    0
            },
            {
                'username': 'Medium AI',
                'password': 'strongpass123',
                'email': 'medai@my_pong_website.com',
                'bar_exp_game1': 5000,
                'is_verified': True,
                'is_active': True,
                't_won':    0
            },
            {
                'username': 'so',
                'password': 'strongpass123',
                'email': 'melsopv@gmail.com',
                'bar_exp_game1': 2234,
                'is_verified': True,
                'is_active': True,
                't_won':    30
            },
            {
                'username': 'Sofiane',
                'password': 'strongpass123',
                'email': 'melsopvbb@gmail.com',
                'bar_exp_game1': 0,
                'is_verified': True,
                'is_active': True,
                't_won':    20
            },
            {
                'username': 'Sadoon',
                'password': 'strongpass123',
                'bar_exp_game1': 234,
                'email': 'alzubaidisadooon@gmail.com',
                'is_verified': True,
                'is_active': True,
                't_won':    10
            },
            {
                'username': 'laewie',
                'password': 'strongpass123',
                'bar_exp_game1': 3234,
                'email': '1233216@gmail.com',
                'is_verified': True,
                'is_active': True,
                't_won':    0
            },
                        {
                'username': 'lhouma',
                'password': 'strongpass123',
                'bar_exp_game1': 3234,
                'email': 'adsadasd6@gmail.com',
                'is_verified': True,
                'is_active': True,
                't_won':    59
            },
                        {
                'username': 'la3ziz',
                'password': 'strongpass123',
                'bar_exp_game1': 3234,
                'email': 'sadads@gmail.com',
                'is_verified': True,
                'is_active': True,
                't_won':    60
            },
                        {
                'username': 'kho',
                'password': 'strongpass123',
                'bar_exp_game1': 3234,
                'email': 'sadasdsad@gmail.com',
                'is_verified': True,
                'is_active': True,
                't_won':    72
            },
                        {
                'username': 'Rayan',
                'password': 'strongpass123',
                'bar_exp_game1': 3234,
                'email': 'rayanmehadjeri6@gmail.com',
                'is_verified': True,
                'is_active': True,
                't_won':    80
            },
        ]

        for user_info in users:
            username = user_info['username']
            password = user_info['password']
            email = user_info['email']
            is_verified = user_info['is_verified']
            xp = user_info['bar_exp_game1']
            t_won = user_info['t_won']
            if not UserProfile.objects.filter(username=username).exists():
                user = UserProfile.objects.create_user(
					username=username, 
					password=password, 
					email=email,
                    bar_exp_game1=xp,
					is_verified=is_verified,
					is_active=user_info['is_active'],
                    t_won=t_won
				)
                self.stdout.write(self.style.SUCCESS(f'Successfully created user "{username}"'))
            else:
                self.stdout.write(self.style.WARNING(f'User "{username}" already exists'))
    
    def generate_game_id(self, userid_1, userid_2):
        timestamp_part = str(int(time.time()))[-6:]
        random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))  # 10 random chars
        return f"{userid_1}_{userid_2}_{timestamp_part}_{random_part}"

    def create_game_records(self):
        games_data = [
            [
                {
                    'player': 'Sofiane',
                    'opponent': 'Hard AI',
                    'score': 7,
                    'map_name': 'Map 1',
                    'is_win': True,
                    'attack_powerup': 2,
                    'shield_powerup': 1,
                    'speed_powerup': 4,
                    'game_duration': 3,
                    'attack_accuracy': 50,
                    'game_mode':'Buff Mode',
                },
                {
                    'player': 'Hard AI',
                    'opponent': 'Sofiane',
                    'score': 2,
                    'map_name': 'Map 1',
                    'is_win': False,
                    'attack_powerup': 4,
                    'shield_powerup': 3,
                    'speed_powerup': 2,
                    'game_duration': 3,
                    'attack_accuracy': 25,
                    'game_mode':'Buff Mode',
                },
            ],
            [
                {
                    'player': 'Rayan',
                    'opponent': 'Sadoon',
                    'score': 7,
                    'map_name': 'Map 2',
                    'is_win': True,
                    'attack_powerup': 1,
                    'shield_powerup': 2,
                    'speed_powerup': 6,
                    'game_duration': 5,
                    'attack_accuracy': 100,
                    'game_mode':'Buff Mode',
                },
                {
                    'player': 'Sadoon',
                    'opponent': 'Rayan',
                    'score': 6,
                    'map_name': 'Map 2',
                    'is_win': False,
                    'attack_powerup': 3,
                    'shield_powerup': 5,
                    'speed_powerup': 6,
                    'game_duration': 5,
                    'attack_accuracy': 66,
                    'game_mode':'Buff Mode',
                }
            ]
        ]

        for game_pair in games_data:
            player_info = game_pair[0]
            opponent_info = game_pair[1]

            player = UserProfile.objects.get(username=player_info['player'])
            opponent = UserProfile.objects.get(username=player_info['opponent'])

            game_id = self.generate_game_id(player.id, opponent.id)

            PongGame.objects.create(
                game_id=game_id,
                user=player,
                opponent=opponent,
                score=player_info['score'],
                map_name=player_info['map_name'],
                is_win=player_info['is_win'],
                attack_powerup=player_info['attack_powerup'],
                shield_powerup=player_info['shield_powerup'],
                speed_powerup=player_info['speed_powerup'],
                game_duration=player_info['game_duration'],
                attack_accuracy=player_info['attack_accuracy'],
                game_mode=player_info['game_mode']
            )
            self.stdout.write(self.style.SUCCESS(f'Created game record for player "{player.username}"'))

            PongGame.objects.create(
                game_id=game_id,
                user=opponent,
                opponent=player,
                score=opponent_info['score'],
                map_name=opponent_info['map_name'],
                is_win=opponent_info['is_win'],
                attack_powerup=opponent_info['attack_powerup'],
                shield_powerup=opponent_info['shield_powerup'],
                speed_powerup=opponent_info['speed_powerup'],
                game_duration=opponent_info['game_duration'],
                attack_accuracy=opponent_info['attack_accuracy'],
                game_mode=opponent_info['game_mode']
            )
            self.stdout.write(self.style.SUCCESS(f'Created game record for opponent "{opponent.username}"'))