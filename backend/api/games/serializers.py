from rest_framework import serializers
from .models import PongGame
from users.serializers import UserProfileSerializer

class PongGameSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    opponent = UserProfileSerializer(read_only=True) 
    class Meta:
        model = PongGame
        fields = ['id', 'user', 'opponent', 'is_win', 'score', 'date_played', 'game_id', 'map_name']

