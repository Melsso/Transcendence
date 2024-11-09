from rest_framework import serializers
from .models import UserProfile
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed, ValidationError

class UserProfileSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = UserProfile
        fields = ['id', 
            'username',
            'email',
            'avatar',
            'bar_exp_game1',
            'biography',
        ]
        read_only_fields = ['id', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    
    password = serializers.CharField(write_only=True)
    avatar = serializers.ImageField(required=False)

    class Meta:
        model = UserProfile
        fields = ['username', 
            'email',
            'password',
            'avatar',
        ]

    def create(self, validated_data):
        user = UserProfile(
            username=validated_data['username'],
            email=validated_data['email'],
            avatar=validated_data.get('avatar'),
            bar_exp_game1=0,
            biography='',
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

    def validate(self, attrs):        
        username = attrs.get('username')
        if not username:
            raise ValidationError({'status':'error', 'detail':'Username field is required'})
        email_val = attrs.get('email')
        if not email_val:
            raise ValidationError({'status':'error', 'detail':'Email field is required.'})
        if UserProfile.objects.filter(email=email_val).exists():
            raise ValidationError({'status':'error', 'detail':'Rmail is already registered.'})        
        password = attrs.get('password')
        if not password:
            raise ValidationError({'status':'error', 'detail':'Password field is required.'})
        validate_password(password)
        return attrs


class LoginSerializer(serializers.Serializer):
    
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        username_or_email = attrs.get('username_or_email')
        password = attrs.get('password')
        if not password:
            raise ValidationError({'status':'error', 'detail': 'nopassword'})
        if not username_or_email:
            raise ValidationError({'status':'error', 'detail': 'nousername'})
        user = None
        if '@' in username_or_email and '.' in username_or_email:
            user = UserProfile.objects.filter(email=username_or_email).first()
            if user:
                if user.is_verified:
                    username_or_email = user.username
                else:
                    raise ValidationError({'status':'error', 'detail': 'unverifiedemail'})
            else:
                raise ValidationError({'status':'error', 'detail':'invalidusername'})
        user = authenticate(username=username_or_email, password=password)
        if user is None:
            raise AuthenticationFailed('Invalid username or password')
        if not user.is_verified:
            raise ValidationError({'status':'error', 'detail': 'unverifiedemail'})
        attrs['user'] = user
        return attrs