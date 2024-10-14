from django.urls import path
from .views import HomePageView, SearchUserView, UpdateUName, UpdateBio, UpdatePwd
# from .views import HomePageView, SearchUserView, UpdateUName, UpdateBio, UpdatePwd, UpdateMail

urlpatterns = [
    path('home/', HomePageView.as_view(), name='home'),
    path('home/search-users/', SearchUserView.as_view(), name='search_users'),
    path('home/settings/updateuname/', UpdateUName.as_view(),name='update_uname'),
    path('home/settings/updatebio/', UpdateBio.as_view(),name='update_bio'),
    path('home/settings/updatepwd/', UpdatePwd.as_view(),name='update_pwd')
    # ,path('home/settings/updatemail/', UpdateMail.as_view(),name='update_mail')
]
