from django.shortcuts import get_object_or_404
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

from .models import Chat, Message, Friend
from .serializers import MessageSerializer, FriendSerializer
# Create your views here.

class CreateChatView(generics.CreateAPIView):
    permissions_classes = [permissions.isAuthenticated]

    def post(self, request, *args, **kwargs):
        # revisit these first 3 lines
        user1 = request.user
        user2_id = request.data.get('user2')
        
        if user2_id is None:
            return Response(
                {"error": "User2 ID is required."},
                status=HTTP_400_BAD_REQUEST
            )
        
        user2 = get_object_or_404(settings.AUTH_USER_MODEL, id=user2_id)

        chat, created = Chat.objects.get_or_create(user1=user1, user2=user2)
        return Response(
            {"chat_id": chat.id},
            status=HTTP_201_CREATED
        )
    
class SendMessageView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageSerializer

    def post(self, request, *args, **kwargs):
        chat_id = request.data.get('chat_id')
        content = request.data.get('content')
        
        if not chat_id or not content:
            return Response(
                {"error": "Chat ID and content are required."},
                status=HTTP_400_BAD_REQUEST
            )
        
        chat = get_object_or_404(Chat, id=chat_id)

        message = Message.objects.create(chat=chat, sender=request.user, content=content)
        return Response(
            {"message_id": message.id},
            status=HTTP_201_CREATED
        )

class MessageListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageSerializer

    def get_queryset(self):
        chat_id = self.kwargs['chat_id']
        return Message.objects.filter(chat_id=chat_id)

class MarkMessageAsReadView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageSerializer

    def patch(self, request, *args, **kwargs):
        message_id = kwargs['message_id']
        message = get_object_or_404(Message, id=message_id)

        if message.sender != request.user:
            return Response(
                {"error": "You cannot mark this message as read."},
                status=HTTP_403_FORBIDDEN
            )

        message.is_read = True
        message.save()
        return Response(
            {"success": "Message marked as read."},
            status=HTTP_200_OK
        )


class FriendListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FriendSerializer

    def get_queryset(self):
        return Friend.objects.filter(user=self.request.user)