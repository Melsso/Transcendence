from django.urls import path
from .views import (
    CreateChatView,
    SendMessageView,
    MessageListView,
    MarkMessageAsReadView,
    FriendListView,
)

urlpatterns = [
    path('friends/', FriendListView.as_view(), name='friend-list')
]
