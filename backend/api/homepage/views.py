from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_201_CREATED,
    HTTP_200_OK,
    HTTP_205_RESET_CONTENT,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_401_UNAUTHORIZED,
    HTTP_500_INTERNAL_SERVER_ERROR,
    HTTP_409_CONFLICT
)

from games.models import PongGame, RrGame
from games.serializers import PongGameSerializer, RrGameSerializer
from users.models import UserProfile
from users.serializers import UserProfileSerializer
from chats.models import Friend
from chats.serializers import FriendSerializer
import logging

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
        sorted_history = sorted(combined_history, key=lambda x: x.get('date_played', datetime.min), reverse=True)

        pending_friends = Friend.objects.filter(
            user=request.user,
            status='PENDING'
        )

        accepted_friends = Friend.objects.filter(
            friend=request.user,
            status='FRIENDS'
        )

        friends = pending_friends | accepted_friends
        friends = friends.distinct()
        friends_data = FriendSerializer(friends, many=True).data

        return Response({
            "user": user_data,
            "match_history": sorted_history,
            "friends": friends_data,
            },
            status=HTTP_200_OK
        )

class SearchUserView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get(self, request):
        query = request.GET.get('search-user-input')

        if not query:
            return Response({'results': None}, status=HTTP_200_OK)
        
        result = UserProfile.objects.filter(username__iexact=query).first()
        if result:
            serializer = self.serializer_class(result)

            pong_games = PongGame.objects.filter(user=result)
            rr_games = RrGame.objects.filter(user=result)
            pong_data = PongGameSerializer(pong_games, many=True).data
            rr_data = RrGameSerializer(rr_games, many=True).data

            for game in pong_data:
                game['game_type'] = 'pong'
            for game in rr_data:
                game['game_type'] = 'rr'
            
            combined_history = pong_data + rr_data
            sorted_history = sorted(combined_history, key=lambda x: x.get('date_played', datetime.min), reverse=True)

            return Response({
                'user': serializer.data,
                'match_history': sorted_history,
                }, 
                status=HTTP_200_OK)
        else:
            return Response({'user': None}, status=HTTP_200_OK)
