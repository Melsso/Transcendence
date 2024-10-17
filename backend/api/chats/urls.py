from django.urls import path
from .views import FriendListView, FriendRequestManager

urlpatterns = [
    path('api/friends/', FriendListView.as_view(), name='friends'),
    path('api/FriendRequestManager/', FriendRequestManager.as_view(), name='send-friend-request')
]
