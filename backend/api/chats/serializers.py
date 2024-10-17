from rest_framework import serializers
from .models import Friend

class FriendSerializer(serializers.ModelSerializer):
    friend_data = serializers.SerializerMethodField()
    user_data = serializers.SerializerMethodField()

    class Meta:
        model = Friend
        fields = ['id', 'friend_data', 'user_data', 'status']

    def get_friend_data(self, obj):
        return {
            'id': obj.friend.id,
            'username': obj.friend.username,
            'avatar': obj.friend.avatar.url if obj.friend.avatar else None,
        }
    
    def get_user_data(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'avatar': obj.user.avatar.url if hasattr(obj.user, 'avatar') and obj.user.avatar else None,
        }