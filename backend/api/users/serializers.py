from rest_framework import serializers
from .models import UserProfile
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate

# This will generate fields based on our model and we can specify what we want regarding which fields can be changed
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 
            'username',
            'email',
            'avatar',
            'bar_exp_game1',
            'bar_exp_game2',
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
            bar_exp_game2=0,
            biography='',
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

    def validate(self, attrs):
        password = attrs.get('password')
        if not password:
            raise serializers.ValidationError({'password': 'This field is required.'})

        try:
            validate_password(password)
        except ValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})
        
        email_val = attrs.get('email')
        if not email_val:
            raise serializers.ValidationError({'email': 'This field is required.'})
        
        if UserProfile.objects.filter(email=email_val).exists():
            raise serializers.ValidationError("This email is already registered.")        
        
        return attrs


# Need to revisit this later for the correct attribute names, as i am not sure wether the name is indeed username_or_email or not, right now its written like that for clarity, this line is insanely long for clarity as well c:

class LoginSerializer(serializers.Serializer):
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username_or_email = attrs.get('username_or_email')
        password = attrs.get('password')
        
        if not password:
            raise serializers.ValidationError({'password': 'This field is required.'})
        
        user = None
        if '@' in username_or_email and '.' in username_or_email:
            user = UserProfile.objects.filter(email=username_or_email).first()
            if user:
                username_or_email = user.username
            else:
                raise serializers.ValidationError('Invalid email address.')
        
        user = authenticate(username=username_or_email, password=password)

        if user is None:
            raise serializers.ValidationError("Invalid credentials. PLease try again")

        attrs['user'] = user
        return attrs