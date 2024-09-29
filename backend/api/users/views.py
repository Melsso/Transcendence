from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, \
    HTTP_200_OK, \
    HTTP_400_BAD_REQUEST, \
    HTTP_404_NOT_FOUND, \
    HTTP_401_UNAUTHORIZED, \
    HTTP_500_INTERNAL_SERVER_ERROR, \
    HTTP_409_CONFLICT \

from rest_framework.exceptions import ValidationError, AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, UserProfileSerializer
from .utils import generate_verification_code
from .models import UserProfile

from django.conf import settings
from django.core.mail import send_mail

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
            print('after mail sending')

            user.verification_code = verification_code
            user.save()
            user_data = UserProfileSerializer(user).data

            return Response({"user": user_data}, status=HTTP_201_CREATED)

        except ValidationError as e:
            error_detail = e.detail.get('detail', '')
            
            if 'Username' in error_detail:
                return Response(
                    {'error': e.detail},
                    status=HTTP_400_BAD_REQUEST
                )
    
            if 'Password' in error_detail:
                return Response(
                    {'error': e.detail},
                    status=HTTP_400_BAD_REQUEST
                )
            
            if 'Email' in error_detail:
                return Response(
                    {'error': e.detail},
                    status=HTTP_400_BAD_REQUEST
                )
            
            if 'Rmail' in error_detail:
                return Response(
                    {'error': e.detail},
                    status=HTTP_401_UNAUTHORIZED
                )
            print('e: ', e.detail)
            
            return Response(
                {'error': str(e.detail)},
                status=HTTP_400_BAD_REQUEST
            )
        
        except Exception as e:
            print('e: ', e.detail)
            return Response(
                {'error': 'An unexpected error occured: ' + str(e)},
                status=HTTP_500_INTERNAL_SERVER_ERROR
            )

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def generate_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }
    
    def get(self, request, *args, **kwargs):
        return 

    def post(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']
            tokens = self.generate_tokens(user)
            user_data = UserProfileSerializer(user).data
            return Response(
                {
                    "user": user_data, 
                    "tokens": tokens
                },
                status=HTTP_200_OK)

        except ValidationError as e:
            error_detail = e.detail.get('detail', '')

            if 'nopassword' in error_detail:
                return Response(
                    {'error': 'No password provided'},
                    status=HTTP_400_BAD_REQUEST
                )
            
            if 'nousername' in error_detail:
                return Response(
                    {'error': 'No username provided'},
                    status=HTTP_400_BAD_REQUEST
                )

            if 'unverifiedemail' in error_detail:
                return Response(x
                    status=HTTP_401_UNAUTHORIZED
                )
            
            if 'invalidusername' in error_detail:
                return Response(
                    {'error': 'User does not exist'},
                    status=HTTP_404_NOT_FOUND
                )
            return Response(
                {'error': e.detail},
                status=HTTP_400_BAD_REQUEST
            )

        except AuthenticationFailed as e:
            return Response(
                {'error': str(e)},
                status=HTTP_401_UNAUTHORIZED
            )
        
        except Exception as e:
            return Response(
                {'error': 'An unexpected error occured: ' + str(e)},
                status=HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyCodeView(generics.GenericAPIView):
    def post(self, request):
        code = request.data.get('code')
        email = request.data.get('email')
    
        try:
            user = UserProfile.objects.get(email=email)
            if user.verification_code == code:
                user.is_verified = True
                user.verification_code = ''
                user.save()
                return Response({"detail": "Verification successful."}, status=HTTP_200_OK)
            else:
                return Response({"detail": "Invalid verification code."}, status=HTTP_400_BAD_REQUEST)
        except UserProfile.DoesNotExist:
            return Response({"detail": "User not found."}, status=HTTP_404_NOT_FOUND)
        

# class ProfileView(generics.GenericAPIView):