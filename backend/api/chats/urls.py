from django.urls import path
from .views import FriendListView

urlspatterns = [
    path('friends/', FriendListView.as_view(), name='friend-list')
]