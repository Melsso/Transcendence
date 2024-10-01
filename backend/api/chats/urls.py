from django.urls import path
from .views import FriendListView

urlpatterns = [
    path('friends/', FriendListView.as_view(), name='friend-list')
]
