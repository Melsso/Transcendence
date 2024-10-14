from django.urls import path
from .views import HomePageView, SearchUserView, UpdateUName, UpdateBio

urlpatterns = [
    path('home/', HomePageView.as_view(), name='home'),
    path('home/search-users/', SearchUserView.as_view(), name='search_users'),
    path('home/settings/updateuname/', UpdateUName.as_view(),name='update_uname'),
]

