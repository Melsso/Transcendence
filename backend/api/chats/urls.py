from django.urls import path
from .views import FriendListView, FriendRequestManager, MessageListView, BlockUserView, UnblockUserView, BlockedUsersView

urlpatterns = [
    path('api/friends/', FriendListView.as_view(), name='friends'),
    path('api/FriendRequestManager/', FriendRequestManager.as_view(), name='send-friend-request'),
    path('api/MessageList/', MessageListView.as_view(), name='message-list'),
    path('api/MessageList/<str:uname>/', MessageListView.as_view(), name='priv-message-list'),
    path('api/friends/blockUser/', BlockUserView.as_view(), name='block_user'),
    path('api/friends/unblockUser/', UnblockUserView.as_view(), name='unblock_user'),
    path('api/friends/blockedUsers/', BlockedUsersView.as_view(), name='blocked_users'),
]
