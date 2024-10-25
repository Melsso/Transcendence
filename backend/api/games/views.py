from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_401_UNAUTHORIZED,
)
from .models import PongGame, RrGame
from users.models import UserProfile
from .serializers import PongGameSerializer, RrGameSerializer
from django.shortcuts import get_object_or_404
import uuid

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
        
        ally_rr_games = RrGame.objects.filter(user=user)
        ally_rr_data = RrGameSerializer(ally_rr_games, many=True).data
        enemy_rr_games = RrGame.objects.filter(opponent=user)
        enemy_rr_data = RrGameSerializer(enemy_rr_games, many=True).data

        pong_games_by_id = {}
        for game in ally_pong_data:
            game['game_type'] = 'pong'
            pong_games_by_id[game['game_id']] = {'ally': game, 'enemy': None}
        
        for game in enemy_pong_data:
            game['game_type'] = 'pong'
  
            if game['game_id'] in pong_games_by_id:
                pong_games_by_id[game['game_id']]['enemy'] = game
            else:
                pong_games_by_id[game['game_id']] = {'ally': None, 'enemy': game}

        rr_games_by_id = {}
        for game in ally_rr_data:
            game['game_type'] = 'rr'
            rr_games_by_id[game['game_id']] = {'ally': game, 'enemy': None}
        
        for game in enemy_rr_data:
            game['game_type'] = 'rr'
            if game['game_id'] in rr_games_by_id:
                rr_games_by_id[game['game_id']]['enemy'] = game
            else:
                rr_games_by_id[game['game_id']] = {'ally': None, 'enemy': game}


        combined_games = {**pong_games_by_id, **rr_games_by_id}

        sorted_games = sorted(combined_games.items(), key=lambda x: x[1]['ally']['date_played'] if x[1]['ally'] else x[1]['enemy']['date_played'], reverse=True)
        sorted_game_list = [{f"game_{i+1}": value} for i, (key, value) in enumerate(sorted_games)]

        return Response({"match_history": sorted_game_list}, status=HTTP_200_OK)

class CreateGameRoomView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        uname = request.user.username
        room_name = f"{uname}_{str(uuid.uuid4())}"
        return Response({'room_name': room_name}, status=HTTP_200_OK)