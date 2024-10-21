from django.urls import path
from .views import FriendListView, FriendRequestManager, MessageListView

urlpatterns = [
    path('api/friends/', FriendListView.as_view(), name='friends'),
    path('api/FriendRequestManager/', FriendRequestManager.as_view(), name='send-friend-request'),
    path('api/MessageList/', MessageListView.as_view(), name='message-list'),
    path('api/MessageList/<str:uname>/', MessageListView.as_view(), name='priv-message-list'),
]
