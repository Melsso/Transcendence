from rest_framework import serializers
from .models import PongGame, RrGame

class PongGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = PongGame
        fields = ['id', 'user', 'opponenet', 'is_win', 'score', 'date_played', 'map_name']

class RrGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = RrGame
        fields = ['id', 'user', 'opponenet', 'is_win', 'score', 'date_played']
