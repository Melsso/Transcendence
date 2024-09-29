from rest_framework import generics, permissions
from rest_framework.response import Response

from .models import PongGame, RrGame
from .serializers import PongGameSerializer, RrGameSerializer

# Create your views here.
class MatchHistoryView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pong_games = PongGame.objects.filter(user=request.user)
        rr_games = RrGame.objects.filter(user=request.user)

        pong_data = PongGameSerializer(pong_games, many=True).data
        rr_data = RrGameSerializer(rr_games, many=True).data

        return Response({
            "pong_games": pong_data,
            "rr_games": rr_data
        })