from django.urls import path
from .views import (
    CreateChatView,
    SendMessageView,
    MessageListView,
    MarkMessageAsReadView,
    FriendListView,
)

urlpatterns = [
    path('', CreateChatView.as_view(), name='create-chat'),
    path('messages/', SendMessageView.as_view(), name='send-message'),
    path('<int:chat_id>/messages/', MessageListView.as_view(), name='list-messages'),
    path('messages/<int:message_id>/read/', MarkMessageAsReadView.as_view(), name='mark-message-as-read'),
    path('friends/', FriendListView.as_view(), name='friend-list')
]
