from rest_framework import serializers
from users.serializers import UserProfileSerializer

from .models import PongGame

class PongGameSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)  # Use serializer for the user
    opponent = UserProfileSerializer(read_only=True) 
    class Meta:
        model = PongGame
        fields = ['id', 'user', 'opponent', 'is_win', 'score', 'date_played', 'game_id', 'map_name']

