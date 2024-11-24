from django.urls import path
from .views import (
HomePageView, SearchUserView, UpdateUNameView, 
UpdateBioView, UpdatePwdView, UpdateAvatarView, 
UpdateTwoFactorAuthView, UpdateEmailView, DeleteGamesView, 
DeleteMessagesView, UpdatePrivacyView, RequestUserDataView
)

urlpatterns = [
    path('api/home/', HomePageView.as_view(), name='home'),
    path('api/home/search-users/', SearchUserView.as_view(), name='search_users'),
    path('api/home/settings/updateuname/', UpdateUNameView.as_view(),name='update_uname'),
    path('api/home/settings/updatebio/', UpdateBioView.as_view(),name='update_bio'),
    path('api/home/settings/updatepwd/', UpdatePwdView.as_view(),name='update_pwd'),
    path('api/home/settings/updateavatar/', UpdateAvatarView.as_view(),name='update_avatar'),
    path('api/home/settings/updateTwoFactorAuth/', UpdateTwoFactorAuthView.as_view(), name='update_two_factor_auth'),
    path('api/home/settings/updateEmail/', UpdateEmailView.as_view(), name='update_email'),
    path('api/home/settings/deleteMessages/', DeleteMessagesView.as_view(), name='delete_messages'),
    path('api/home/settings/deleteGames/', DeleteGamesView.as_view(), name='delete_games'),
    path('api/home/settings/updatePrivacy/', UpdatePrivacyView.as_view(), name='update_privacy'),
    path('api/home/settings/requestUserData/', RequestUserDataView.as_view(), name='request_user_data'),
]
