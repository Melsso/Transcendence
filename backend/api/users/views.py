from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, UserProfileSerializer
from .utils import generate_verification_code, send_verification_email
from .models import UserProfile

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        verification_code = generate_verification_code()
        send_verification_email(user.email, verification_code)

        user.verification_code = verification_code
        user.save()

        user_data = UserProfileSerializer(user).data

        return Response({"user": user_data}, status=HTTP_201_CREATED)

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
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        
        tokens = self.generate_tokens(user)

        user_data = UserProfileSerializer(user).data

        return Response({
                "user": user_data, 
                "tokens": tokens
            }, status=HTTP_200_OK)


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