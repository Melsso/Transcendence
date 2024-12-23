from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_401_UNAUTHORIZED,
)
from .models import PongGame
from .serializers import PongGameSerializer
from users.models import UserProfile
import uuid
import random
import logging
import string
import time

logger = logging.getLogger(__name__)

class MatchHistoryView(generics.ListAPIView):

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, uname=None):
        user = request.user
        if uname is not None:
            user = get_object_or_404(UserProfile, username=uname)
        ally_pong_games = PongGame.objects.filter(user=user)
        ally_pong_data = PongGameSerializer(ally_pong_games, many=True).data
        enemy_pong_games = PongGame.objects.filter(opponent=user)
        enemy_pong_data = PongGameSerializer(enemy_pong_games, many=True).data
        pong_games_by_id = {}
        for game in ally_pong_data:
            pong_games_by_id[game['game_id']] = {'ally': game, 'enemy': None}
        for game in enemy_pong_data:
            if game['game_id'] in pong_games_by_id:
                pong_games_by_id[game['game_id']]['enemy'] = game
            else:
                pong_games_by_id[game['game_id']] = {'ally': None, 'enemy': game}
        game_list = {**pong_games_by_id}
        sorted_games = sorted(game_list.items(), key=lambda x: x[1]['ally']['date_played'] if x[1]['ally'] else x[1]['enemy']['date_played'], reverse=True)
        sorted_game_list = [{f"game_{i+1}": value} for i, (key, value) in enumerate(sorted_games)]
        return Response({'status':'success', 'detail':'Match History Fetched', 'match_history': sorted_game_list}, status=HTTP_200_OK)

class CreateGameRoomView(generics.CreateAPIView):

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        uname = request.user.username
        room_name = f"{uname}_{str(uuid.uuid4())}"
        return Response({'status':'success', 'detail':'Room Name Generated', 'room_name': room_name}, status=HTTP_200_OK)

class CreateTournamentRoomView(generics.CreateAPIView):

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        uname = request.user.username
        targ = request.header.get('TargetUsername')
        if targ:
            uname = targ
        tournament_room_name = f"{uname}_{str(uuid.uuid4())}"
        return Response({'status':'success', 'detail':'Tournament Room Name Generated', 'tournament_room_name': tournament_room_name}, status=HTTP_200_OK)
    
class GameResultView(generics.CreateAPIView):

    permission_classes = [permissions.IsAuthenticated]

    def generate_game_id(self, userid_1, userid_2):
        timestamp_part = str(int(time.time()))[-6:]
        random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"{userid_1}_{userid_2}_{timestamp_part}_{random_part}"

    def post(self, request):
        op = None
        win = False
        game_id = request.data.get('game_id')
        exp = request.data.get('exp')
        stats = request.data.get('stats')
        loser = request.data.get('loser')
        winner_uname = request.data.get('winner')
        forfeit = request.data.get('forfeit')
        if forfeit is None:
            forfeit = False
        user = request.user
        if user.username == winner_uname:
            user.bar_exp_game1 += exp
            win = True
            op = UserProfile.objects.get(username=loser)
        else:
            user.bar_exp_game1 -= exp
            op = UserProfile.objects.get(username=winner_uname)
        if user.bar_exp_game1 <= 0:
            user.bar_exp_game1 = 0
        user.save()
        if forfeit:
            stats['attack_accuracy'] = 0.0
            stats['game_duration'] = 0.0
            stats['attack_powerup'] = 0
            stats['shield_powerup'] = 0
            stats['speed_powerup'] = 0
        stats['game_duration'] = stats['game_duration']
        if op.username in ('Easy AI', 'Medium AI', 'Hard AI'):
            game_id = self.generate_game_id(user.id, op.id)
            PongGame.objects.create(
                game_id=game_id,
                user=op,
                opponent=user,
                score=stats['score2'],
                map_name=stats['map'],
                attack_accuracy=stats['attack_accuracy'],
                game_duration=stats['game_duration'],
                attack_powerup=stats['attack_powerup'],
                shield_powerup=stats['shield_powerup'],
                speed_powerup=stats['speed_powerup'],
                game_mode=stats['game_mode'],
                is_win= not win,
                is_forfeit=False
        )

        PongGame.objects.create(
            game_id=game_id,
            user=user,
            opponent=op,
            score=stats['score1'],
            map_name=stats['map'],
            attack_accuracy=stats['attack_accuracy'],
            game_duration=stats['game_duration'],
            attack_powerup=stats['attack_powerup'],
            shield_powerup=stats['shield_powerup'],
            speed_powerup=stats['speed_powerup'],
            game_mode=stats['game_mode'],
            is_win= win,
            is_forfeit=forfeit
        )

        return Response({'status':'success', 'detail':'Game Logs Saved'}, status=HTTP_200_OK)
