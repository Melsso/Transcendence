from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.conf import settings
from django.core.mail import send_mail
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.status import (
    HTTP_201_CREATED,
    HTTP_200_OK,
    HTTP_205_RESET_CONTENT,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_401_UNAUTHORIZED,
    HTTP_500_INTERNAL_SERVER_ERROR,
)
from .models import UserProfile
from .serializers import RegisterSerializer, LoginSerializer, UserProfileSerializer
from .utils import generate_verification_code
from chats.models import Friend

class RegisterView(generics.CreateAPIView):

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            verification_code = generate_verification_code()
            subject = 'Your Verification Code'
            message = f'Your verification code is: {verification_code}'
            send_mail(subject, message, settings.EMAIL_HOST_USER, [user.email])
            user.verification_code = verification_code
            user.save()
            user_data = UserProfileSerializer(user).data
            return Response({'status':'success', 'detail':'Sent Verification Code!', 'user_email':user_data['email']}, status=HTTP_201_CREATED)
        
        except ValidationError as e:
            error_detail = e.detail.get('detail', '')    
            if 'Username' in error_detail:
                return Response({'status':'error', 'detail':e.detail}, status=HTTP_400_BAD_REQUEST)
            if 'Password' in error_detail:
                return Response({'status':'error', 'detail':e.detail}, status=HTTP_400_BAD_REQUEST)
            if 'Email' in error_detail:
                return Response({'status':'error', 'detail':e.detail}, status=HTTP_400_BAD_REQUEST)
            if 'Rmail' in error_detail:
                return Response({'status':'error', 'detail':e.detail}, status=HTTP_401_UNAUTHORIZED)
            print('e: ', e.detail)
            return Response({'status':'error', 'detail':str(e.detail)}, status=HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            print('e: ', e.detail)
            return Response({'status':'error', 'detail':'An unexpected error occured: ' + str(e)}, status=HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(generics.GenericAPIView):

    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def generate_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']
            tokens = self.generate_tokens(user)
            user_data = UserProfileSerializer(user).data
            return Response({'status':'success', 'tokens': tokens}, status=HTTP_200_OK)

        except ValidationError as e:
            error_detail = e.detail.get('detail', '')
            if 'nopassword' in error_detail:
                return Response({'status':'error', 'detail':'No password provided'}, status=HTTP_400_BAD_REQUEST)
            if 'nousername' in error_detail:
                return Response({'status':'error', 'detail':'No username provided'}, status=HTTP_400_BAD_REQUEST)
            if 'unverifiedemail' in error_detail:
                return Response({'status':'error', 'detail':'Email not verified'}, status=HTTP_401_UNAUTHORIZED)
            if 'invalidusername' in error_detail:
                return Response({'status':'error', 'detail':'User does not exist'}, status=HTTP_404_NOT_FOUND)
            return Response({'status':'error', 'detail':e.detail}, status=HTTP_400_BAD_REQUEST)

        except AuthenticationFailed as e:
            return Response({'status':'error', 'detail':str(e)}, status=HTTP_401_UNAUTHORIZED)
        
        except Exception as e:
            return Response({'status':'error', 'detail':'An unexpected error occured: ' + str(e)}, status=HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyCodeView(generics.GenericAPIView):
    
    def post(self, request):
        code = request.data.get('code')
        email = request.data.get('email')
        avatar = request.FILES.get('avatar')
        try:
            user = UserProfile.objects.get(email=email)
            if user.verification_code == code:
                user.is_verified = True
                user.verification_code = ''
                if avatar:
                    user.avatar = avatar
                user.save()
                return Response({'status':'success', 'detail':'Verification successful.'}, status=HTTP_200_OK)
            else:
                return Response({'status':'error', 'detail':'Invalid verification code.'}, status=HTTP_400_BAD_REQUEST)
        except UserProfile.DoesNotExist:
            return Response({'status':'error', 'detail':'User not found.'}, status=HTTP_404_NOT_FOUND)
        
class DeletedUserView(generics.GenericAPIView):

    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        password = request.data.get('password')
        delUser = authenticate(username=request.user.username, password=password)
        user = request.user
        if delUser is None:
            return Response({'status':'error', 'detail':'Password is incorrect.'}, status=HTTP_400_BAD_REQUEST)        
        try:
            user.username = f"[Deleted_User{user.id}]"
            user.password = ""
            user.email = "deleted@deleted.com"
            user.bio = ""
            user.avatar = None
            user.save()
            Friend.objects.filter(user=user).delete()
            Friend.objects.filter(friend=user).delete()
            return Response({'status':'success', 'detail':'Account deleted successfuly!'}, status=HTTP_200_OK)
        
        except Exception as e:
            return Response({'status':'error', 'detail':str(e)}, status=HTTP_400_BAD_REQUEST)


class LogoutView(generics.GenericAPIView):

    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token is None:
                return Response({'status':'error', 'detail':'No refresh token'}, status=HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'status':'success', 'detail':'Logged Out Successfully'}, status=HTTP_205_RESET_CONTENT)
        
        except TokenError as e:
            return Response({'status':'error', 'detail':str(e)}, status=HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({'status':'error', 'detail':str(e)}, status=HTTP_400_BAD_REQUEST)

class ForgotPasswordView(generics.GenericAPIView):

    def post(self, request):
        try:
            email = request.data.get("email")
            if email is None:
                return Response({'status':'error', 'detail':'No email'}, status=HTTP_400_BAD_REQUEST)
            user = UserProfile.objects.get(email=email)
            if user is None:
                Response({'status':'error', 'detail':'User not found.'}, status=HTTP_404_NOT_FOUND)
            verification_code = generate_verification_code()
            subject = 'Your Verification Code'
            message = f'Your verification code is: {verification_code}'
            send_mail(subject, message, settings.EMAIL_HOST_USER, [user.email])
            user.verification_code = verification_code
            user.save()
            return Response({'status':'success', 'detail':'Verification Code Sent!'}, status=HTTP_200_OK)

        except UserProfile.DoesNotExist:
            return Response({'status':'error', 'detail': 'User not found.'}, status=HTTP_404_NOT_FOUND)

class ResetPasswordView(generics.GenericAPIView):

    def post(self, request, *args, **kwargs):
        verification_code = request.data.get("verf_code")
        new_pass = request.data.get("password")
        email = request.data.get("email")
        try:
            user = UserProfile.objects.get(email=email)
            if user.verification_code == verification_code:
                user.is_verified = True
                user.verification_code = ''
            else:
                return Response({'status':'error', 'detail':'Invalid verification code.'}, status=HTTP_400_BAD_REQUEST)
        
            try:
                validate_password(new_pass)
            
            except ValidationError as e:
                if hasattr(e, 'message'):
                    error_message = e.message
                else:
                    error_message = e.messages
                return Response({'status':'error', 'detail':error_message}, status=HTTP_400_BAD_REQUEST)
            user.set_password(new_pass)
            user.save()
            return Response({'status':'success', 'detail':'Password changed'}, status=HTTP_200_OK)
        
        except UserProfile.DoesNotExist:
            return Response({'status':'error', 'detail':'User not found.'}, status=HTTP_404_NOT_FOUND)