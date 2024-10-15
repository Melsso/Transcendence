from django.urls import path
from .views import FriendListView, FriendRequestManager

urlpatterns = [
    path('friends/', FriendListView.as_view(), name='friends'),
    path('FriendRequestManager/', FriendRequestManager.as_view(), name='send-friend-request')
]
