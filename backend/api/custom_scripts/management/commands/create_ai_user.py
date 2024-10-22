from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from games.models import RrGame, PongGame
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
                'username': 'ai',
                'password': 'strongpass123',
                'email': 'ai@my_pong_website.com',
                'is_verified': True,
                'is_active': True
            },
            {
                'username': 'Sofiane',
                'password': 'strongpass123',
                'email': 'sofiane@my_pong_website.com',
                'is_verified': True,
                'is_active': True
            },
            {
                'username': 'Sadoon',
                'password': 'strongpass123',
                'email': 'sadoon@my_pong_website.com',
                'is_verified': True,
                'is_active': True
            },
            {
                'username': 'Rayan',
                'password': 'strongpass123',
                'email': 'rayan@my_pong_website.com',
                'is_verified': True,
                'is_active': True
            },
        ]

        for user_info in users:
            username = user_info['username']
            password = user_info['password']
            email = user_info['email']
            is_verified = user_info['is_verified']

            if not UserProfile.objects.filter(username=username).exists():
                user = UserProfile.objects.create_user(
					username=username, 
					password=password, 
					email=email, 
					is_verified=is_verified,
					is_active=user_info['is_active']
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
                    'opponent': 'ai',
                    'score': 15,
                    'map_name': 'Map1',
                    'is_win': True
                },
                {
                    'player': 'ai',
                    'opponent': 'Sofiane',
                    'score': 13,
                    'map_name': 'Map1',
                    'is_win': False
                },
            ],
            [
                {
                    'player': 'Rayan',
                    'opponent': 'Sadoon',
                    'score': 16,
                    'map_name': 'Map2',
                    'is_win': True
                },
                {
                    'player': 'Sadoon',
                    'opponent': 'Rayan',
                    'score': 15,
                    'map_name': 'Map2',
                    'is_win': False
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
                attack_accuracy=random.randint(50, 100),
                map_name=player_info['map_name'],
                shield_powerup=random.randint(0, 3),
                is_win=player_info['is_win']
            )
            self.stdout.write(self.style.SUCCESS(f'Created game record for player "{player.username}"'))

            PongGame.objects.create(
                game_id=game_id,
                user=opponent,
                opponent=player,
                score=opponent_info['score'],
                attack_accuracy=random.randint(50, 100),
                map_name=opponent_info['map_name'],
                shield_powerup=random.randint(0, 3),
                is_win=opponent_info['is_win']
            )
            self.stdout.write(self.style.SUCCESS(f'Created game record for opponent "{opponent.username}"'))