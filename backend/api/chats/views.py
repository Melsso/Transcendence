from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
)
from .models import Friend, Message
from users.models import UserProfile
from .serializers import FriendSerializer, MessageSerializer
import logging
logger = logging.getLogger(__name__)

User = get_user_model()

class FriendListView(generics.ListAPIView):

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FriendSerializer

    def get_queryset(self):
        user = self.request.user
        friends = Friend.objects.filter(status='FRIENDS').filter(Q(user=user) | Q(friend=user))
        friend_requests = Friend.objects.filter(friend=user, status='PENDING')
        return friends.union(friend_requests)

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({'status':'success', 'detail':'Fetched Current Friends', 'friends': serializer.data}, status=HTTP_200_OK)

class BlockedUsersView(generics.GenericAPIView):

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FriendSerializer

    def get(self, request):
        user = request.user

        blocked_list = Friend.objects.filter(user=user, status='BLOCKED')
        serializer = self.get_serializer(blocked_list, many=True)
        return Response({'status':'success', 'detail':'Fetched The List Of Blocked Users', 'blocked_list': serializer.data}, status=HTTP_200_OK)

class BlockUserView(generics.GenericAPIView):

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        target = request.data.get('target')

        target_user = UserProfile.objects.filter(username=target).first()
        if target_user is None:
            return Response({'status':'error', 'detail':'No Such User Found!'}, status=HTTP_400_BAD_REQUEST)
        
        status = Friend.objects.filter(user=user, friend=target_user, status='BLOCKED').first()
        if status:
            return Response({'status':'success', 'detail':'User Already Blocked!'}, status=HTTP_200_OK)
        
        existing_relation = Friend.objects.filter(user=user, friend=target_user).first()
        existing_relation_flipped = Friend.objects.filter(user=target_user, friend=user).first()

        if existing_relation:
            existing_relation.status = 'BLOCKED'
            existing_relation.save()
            return Response({'status':'success', 'detail':'User Blocked!'}, status=HTTP_200_OK)
        elif existing_relation_flipped:
            if existing_relation_flipped.status != 'BLOCKED':
                existing_relation_flipped.delete()
            Friend.objects.create(user=user, friend=target_user, status='BLOCKED')
            return Response({'status':'success', 'detail':'User Blocked!'}, status=HTTP_200_OK)
        else:
            Friend.objects.create(user=user, friend=target_user, status='BLOCKED')
            return Response({'status':'success', 'detail':'User Blocked!'}, status=HTTP_200_OK)

class UnblockUserView(generics.GenericAPIView):

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        target = request.data.get('target')

        target_user = UserProfile.objects.filter(username=target).first()
        if target_user is None:
            return Response({'status':'error', 'detail':'No Such User Found!'}, status=HTTP_400_BAD_REQUEST)

        relation = Friend.objects.filter(user=user, friend=target_user, status='BLOCKED').first()
        if relation is None:
            return Response({'status':'error', 'detail':'User Already Unblocked!'}, status=HTTP_400_BAD_REQUEST)
        else:
            relation.delete()
            return Response({'status':'success', 'detail':'User Unblocked!'}, status=HTTP_200_OK)
        
class FriendRequestManager(generics.ListAPIView):

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FriendSerializer

    def post(self, request, *args, **kwargs):
        user = request.user
        target_id = request.data.get('target_id')
        if target_id is None:
            return Response({'status':'error', 'detail':'No target_id provided'}, status=HTTP_400_BAD_REQUEST)
        target_user = get_object_or_404(User, id=target_id)
        if target_user is None:
            return Response({'status':'error', 'detail':'No Such User'}, status=HTTP_400_BAD_REQUEST)
        
        existing_request = Friend.objects.filter(user=user, friend=target_user).first()
        if existing_request:
            if existing_request.status == 'PENDING':
                return Response({'status':'error', 'detail':'You Already Have Either Sent A Friend Request Of Have Received One From This User!'}, status=HTTP_400_BAD_REQUEST)
            elif existing_request.status == 'BLOCKED':
                return Response({'status':'error', 'detail':'You Blocked This User, Please Unblock Them First.'}, status=HTTP_400_BAD_REQUEST)
            elif existing_request.status == 'FRIENDS':
                return Response({'status':'error', 'detail':'You Are Already Friends!'}, status=HTTP_400_BAD_REQUEST)
        
        existing_incoming_request = Friend.objects.filter(user=target_user, friend=user).first()
        if existing_incoming_request:
            
            if existing_incoming_request.status == 'PENDING':
                return Response({'status':'error', 'detail':'Maybe Check Your Friend Requests List?', 'flag':'nonError'}, status=HTTP_400_BAD_REQUEST)
            elif existing_incoming_request.status == 'BLOCKED':
                return Response({'status':'error', 'detail':'You Can Not Add This User.'}, status=HTTP_400_BAD_REQUEST)
            elif existing_incoming_request.status == 'FRIENDS':
                return Response({'status':'error', 'detail':'You Are Already Friends!'}, status=HTTP_400_BAD_REQUEST)
                
        friend_request = Friend.objects.create(user=user, friend=target_user)
        return Response({'status':'success', 'detail': 'Friend Request Sent!'}, status=HTTP_201_CREATED)
    
    def put(self, request, *args, **kwargs):
        user = request.user
        target_id = request.data.get('target_id')
        nature = request.data.get('nature')
        if target_id is None:
            return Response({'status':'error', 'detail':'No target_id provided'}, status=HTTP_400_BAD_REQUEST)
        if nature is None:
            return Response({'status':'error', 'detail':'No action provided'}, status=HTTP_400_BAD_REQUEST)
        if nature == 'delete':
            friend_entry = get_object_or_404(Friend, Q(user=target_id, friend=user) | Q(user=user, friend=target_id), status='FRIENDS')
            friend_entry.delete()
            return Response({'status':'success', 'detail': 'Friend Deleted'}, status=HTTP_200_OK)
        friend_request = get_object_or_404(Friend, user=target_id, friend=user, status='PENDING')
        if nature == 'accept':
            friend_request.status = 'FRIENDS'
            friend_request.save()
            return Response({'status':'success', 'detail': 'Friend Request Accepted!'}, status=HTTP_200_OK)
        if nature == 'refuse':
            friend_request.delete()
            return Response({'status':'success', 'detail': 'Friend request refused!'}, status=HTTP_200_OK)

class MessageListView(generics.ListAPIView):

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageSerializer

    def get_queryset(self):
        user = self.request.user
        targ_uname = self.kwargs.get('uname')
        if targ_uname:
            return Message.objects.filter( Q(sender=user, target_user__username=targ_uname) | Q(sender__username=targ_uname, target_user=user)).order_by('timestamp')
        else:
            return Message.objects.filter(target_user__isnull=True).order_by('timestamp')

    def get(self, request, uname=None):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response({'status':'success', 'detail':'Returning serialized Data list', 'list': serializer.data}, status=HTTP_200_OK)
