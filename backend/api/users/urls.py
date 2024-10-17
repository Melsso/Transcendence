from django.urls import path
from .views import RegisterView, LoginView, VerifyCodeView, LogoutView

urlpatterns = [
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/verify-code/', VerifyCodeView.as_view(), name='verify-code'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
]