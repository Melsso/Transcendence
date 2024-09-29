from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.response import Response

from users.serializers import UserProfileSerializer

from game.models import PongGame, RrGame
from game.serializers import PongGameSerializer, RrGameSerializer

from chat.models import Friend
from chat.serializers import FriendSerializer

# Create your views here.
class HomePageView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_data = UserProfileSerializer(request.user).data

        pong_games = PongGame.objects.filter(user=request.user)
        rr_games = RrGame.objects.filter(user=request.user)
        pong_data = PongGameSerializer(pong_games, many=True).data
        rr_data = RrGameSerializer(rr_games, many=True).data

        for game in pong_data:
            game['game_type'] = 'pong'
        for game in rr_data:
            game['game_type'] = 'rr'
        
        combined_history = pong_data + rr_data
        sorted_history = sorted(combined_history, key=lambda x: x['date_played'], reverse=True)

        friends = Friend.objects.filter(user=request.user)
        friends_data = FriendSerializer(friends, many=True).data

        return Response({
            'user': user_data,
            'match_history': sorted_history,
            'friends': friends_data,
        })