from django.urls import path
from .views import HomePageView, SearchUserView

urlpatterns = [
    path('home/', HomePageView.as_view(), name='home'),
    path('home/search-users/', SearchUserView.as_view(), name='search_users'),
]

