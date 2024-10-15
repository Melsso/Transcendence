from rest_framework import serializers
from .models import Friend

class FriendSerializer(serializers.ModelSerializer):
    friend_data = serializers.SerializerMethodField()

    class Meta:
        model = Friend
        fields = ['friend', 'friend_data']

    def get_friend_data(self, obj):
        return {
            'id': obj.friend.id,
            'username': obj.friend.username,
            'avatar': obj.friend.avatar.url if obj.friend.avatar else None,
            'status': obj.status
        }