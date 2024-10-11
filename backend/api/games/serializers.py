from rest_framework import serializers
from users.serializers import UserProfileSerializer

from .models import PongGame, RrGame

class PongGameSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)  # Use serializer for the user
    opponent = UserProfileSerializer(read_only=True) 
    class Meta:
        model = PongGame
        fields = ['id', 'user', 'opponent', 'is_win', 'score', 'date_played', 'map_name']

class RrGameSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)  # Use serializer for the user
    opponent = UserProfileSerializer(read_only=True) 
    class Meta:
        model = RrGame
        fields = ['id', 'user', 'opponent', 'is_win', 'score', 'date_played']
