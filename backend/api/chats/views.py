from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_403_FORBIDDEN,
)

from .models import Friend
from .serializers import FriendSerializer
from users.serializers import UserProfileSerializer
# Create your views here.
User = get_user_model()

class FriendListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FriendSerializer

    def get_queryset(self):
        user = self.request.user
        
        friends = Friend.objects.filter(status='FRIENDS').filter(
            Q(user=user) | Q(friend=user)
        )

        friend_requests = Friend.objects.filter(friend=user, status='PENDING')

        return friends.union(friend_requests)

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        return Response({'friends': serializer.data}, status=HTTP_200_OK)

class FriendRequestManager(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FriendSerializer

    def post(self, request, *args, **kwargs):
        user = request.user
        target_id = request.data.get('target_id')

        if target_id is None:
            return Response({'detail':'No target_id provided'}, status=HTTP_400_BAD_REQUEST)
        
        target_user = get_object_or_404(User, id=target_id)
        if target_user is None:
            return Response({'detail':'No Such User'}, status=HTTP_400_BAD_REQUEST)
        
        existing_request = Friend.objects.filter(user=user, friend=target_user).first()
        if existing_request:
            return Response({'detail':'Already Sent A Request'}, status=HTTP_400_BAD_REQUEST)

        friend_request = Friend.objects.create(user=user, friend=target_user)

        return Response({'detail': 'Friend Request Sent!'}, status=HTTP_201_CREATED)
    
    def put(self, request, *args, **kwargs):
        user = request.user
        target_id = request.data.get('target_id')
        nature = request.data.get('nature')

        if target_id is None:
            return Response({'detail':'No target_id provided'}, status=HTTP_400_BAD_REQUEST)
        if nature is None:
            return Response({'detail':'No action provided'}, status=HTTP_400_BAD_REQUEST)

        if nature == 'delete':
            friend_entry = get_object_or_404(
                Friend,
                Q(user=target_id, friend=user) | Q(user=user, friend=target_id),
                status='FRIENDS'
            )
            friend_entry.delete()
            return Response(status=HTTP_200_OK)

        friend_request = get_object_or_404(Friend, user=target_id, friend=user, status='PENDING')

        if nature == 'accept':
            friend_request.status = 'FRIENDS'
            friend_request.save()
            return Response({'detail': 'Friend Request Accepted!'}, status=HTTP_200_OK)

        if nature == 'refuse':
            friend_request.delete()
            return Response({'detail': 'Friend request refused!'}, status=HTTP_200_OK)
