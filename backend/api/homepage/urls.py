from django.urls import path
from .views import HomePageView, SearchUserView, UpdateUName, UpdateBio, UpdatePwd
# from .views import HomePageView, SearchUserView, UpdateUName, UpdateBio, UpdatePwd, UpdateMail

urlpatterns = [
    path('api/home/', HomePageView.as_view(), name='home'),
    path('api/home/search-users/', SearchUserView.as_view(), name='search_users'),
    path('api/home/settings/updateuname/', UpdateUName.as_view(),name='update_uname'),
    path('api/home/settings/updatebio/', UpdateBio.as_view(),name='update_bio'),
    path('api/home/settings/updatepwd/', UpdatePwd.as_view(),name='update_pwd')
    # ,path('home/settings/updatemail/', UpdateMail.as_view(),name='update_mail')
]
