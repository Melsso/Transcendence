from django.urls import path
from .views import RegisterView, LoginView, VerifyCodeView, LogoutView, ForgotPasswordView, ResetPasswordView, DeletedUserView, GuestLoginView, GuestLogoutView, RefreshTokenView

urlpatterns = [
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/verify-code/', VerifyCodeView.as_view(), name='verify-code'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    path('api/forgot/', ForgotPasswordView.as_view(), name='forgot'),
    path('api/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('api/delete-account/', DeletedUserView.as_view(), name='deleted-account'),
    path('api/guest-login/', GuestLoginView.as_view(), name='guest-login'),
    path('api/guest-logout/', GuestLogoutView.as_view(), name='guest-logout'),
	path('api/refresh-token/', RefreshTokenView.as_view(), name='refresh-token'),
]