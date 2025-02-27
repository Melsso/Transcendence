from django.contrib.auth import authenticate
from asgiref.sync import async_to_sync
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.conf import settings
import uuid
from games.models import PongGame
import aioredis
import logging
from django.core.mail import send_mail
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework.status import (
    HTTP_201_CREATED,
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_401_UNAUTHORIZED,
    HTTP_500_INTERNAL_SERVER_ERROR,
)
from .models import UserProfile
from .serializers import RegisterSerializer, LoginSerializer, UserProfileSerializer
from .utils import generate_verification_code
from chats.models import Friend
logger = logging.getLogger(__name__)
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
            return Response({'status':'success', 'detail':'Logged Out Successfully'}, status=HTTP_200_OK)
        
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

class GuestLoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def generate_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }

    def create_guest_user(self):
        guest_username = f"Guest_{uuid.uuid4().hex[:8]}"
        guest_email = f"{guest_username}@guest.local"
        avatar = 'avatars/avatar1.svg'
        user = UserProfile.objects.create_user(
            username=guest_username,
            email=guest_email,
            avatar = avatar,
        )
        user.is_verified = True
        user.set_unusable_password()
        user.save()
        return user

    def post(self, request, *args, **kwargs):
        try:
            user = self.create_guest_user()
            tokens = self.generate_tokens(user)
            
            user_data = {
                "username": user.username,
                "email": user.email 
            }
            
            return Response({
                'status': 'success',
                'user': user_data,
                'tokens': tokens
            }, status=HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'status': 'error',
                'detail': f"An unexpected error occurred: {str(e)}"
            }, status=HTTP_500_INTERNAL_SERVER_ERROR)

class GuestLogoutView(generics.GenericAPIView):

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        try:
            if user.email.endswith("@guest.local") or user.username.startswith("Guest_"):
                lst = PongGame.objects.filter(user=user)
                lst.delete()
                user.delete()
                return Response({"status": "success", "detail": "Guest account deleted upon logout."}, status=200)

            request.auth.delete()
            return Response({"status": "success", "detail": "User logged out successfully."}, status=200)

        except Exception as e:
            return Response({"status": "error", "detail": f"An error occurred: {str(e)}"}, status=500)

class RefreshTokenView(TokenRefreshView):

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({'status':'Error', 'detail': str(e)}, status=HTTP_400_BAD_REQUEST)

        return Response({'status':'success', 'detail':'Creation success', 'data':serializer.validated_data}, status=HTTP_200_OK)


class GetLogsView(generics.GenericAPIView):
    async def check_user_in_redis(self, username):
        redis = await aioredis.from_url("redis://redis:6379")
        users = await redis.smembers("chat_global_room_users")
        users = [user.decode("utf-8") for user in users]
        await redis.close()
        return username in users

    def post(self, request, *args, **kwargs):
        uname = request.data.get('username')
        user_exists = async_to_sync(self.check_user_in_redis)(uname)
        if user_exists:
            return Response({'status': 'fail', 'detail': 'User Logged in!', 'flag': True}, status=HTTP_200_OK)
        else:
            return Response({'status': 'success', 'detail': 'User not logged in!', 'flag': False}, status=HTTP_200_OK)

class ForceLoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def generate_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }

    def put(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        try:
            user = UserProfile.objects.get(username=username)
        except UserProfile.DoesNotExist:
            return Response({'status': 'fail', 'detail': 'No such user found!'}, status=HTTP_400_BAD_REQUEST)
        
        if not user.check_password(password):
            return Response({'status': 'fail', 'detail': 'Wrong Password!'}, status=HTTP_401_UNAUTHORIZED)
        

        tokens = self.generate_tokens(user)
        return Response({'status':'success', 'tokens': tokens}, status=HTTP_200_OK)