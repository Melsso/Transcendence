from django.urls import path
from .views import HomePageView, SearchUserView, UpdateUName, UpdateBio, UpdatePwd, UpdateAvatar, UpdateTwoFactorAuth

urlpatterns = [
    path('api/home/', HomePageView.as_view(), name='home'),
    path('api/home/search-users/', SearchUserView.as_view(), name='search_users'),
    path('api/home/settings/updateuname/', UpdateUName.as_view(),name='update_uname'),
    path('api/home/settings/updatebio/', UpdateBio.as_view(),name='update_bio'),
    path('api/home/settings/updatepwd/', UpdatePwd.as_view(),name='update_pwd'),
    path('api/home/settings/updateavatar/', UpdateAvatar.as_view(),name='update_avatar'),
    path('api/home/settings/updateTwoFactorAuth/', UpdateTwoFactorAuth.as_view(), name='update_two_factor_auth'),
]
