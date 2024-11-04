from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST,
    HTTP_409_CONFLICT
)
from django.contrib.auth import authenticate
from users.models import UserProfile
from users.serializers import UserProfileSerializer
from chats.models import Friend
from chats.serializers import FriendSerializer
import logging

# Create your views here.
class HomePageView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_data = UserProfileSerializer(request.user).data
       
        pending_friends = Friend.objects.filter(
            user=request.user,
            status='PENDING'
        )

        accepted_friends = Friend.objects.filter(
            friend=request.user,
            status='FRIENDS'
        )

        friends = pending_friends | accepted_friends
        friends = friends.distinct()
        friends_data = FriendSerializer(friends, many=True).data

        return Response({
            "user": user_data,
            "friends": friends_data,
            },
            status=HTTP_200_OK
        )

class SearchUserView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get(self, request):
        query = request.GET.get('search-user-input')

        if not query:
            return Response({'results': None}, status=HTTP_200_OK)
        
        result = UserProfile.objects.filter(username__iexact=query).first()
        if result:
            serializer = self.serializer_class(result)
            return Response({'user': serializer.data}, status=HTTP_200_OK)
        else:
            return Response({'user': None}, status=HTTP_200_OK)

class UpdateUName(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        uname = request.data.get('username')

        if uname is None:
            return Response({'detail': 'Username empty'}, status=HTTP_400_BAD_REQUEST)

        if UserProfile.objects.filter(username=uname).exists():
            return Response({'detail': 'Username already in use'}, status=HTTP_409_CONFLICT)
        
        curr_user = request.user
        curr_user.username = uname
        curr_user.save()

        return Response({'detail': 'Username changed'}, status=HTTP_200_OK)

class UpdateBio(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, *args, **kwargs):
        new_bio = request.data.get('bio')

        if new_bio is None:
            return Response({'detail': 'Bio empty'}, status=HTTP_400_BAD_REQUEST)

        curr_user = request.user
        curr_user.biography = new_bio
        curr_user.save()

        return Response({'detail': 'Bio changed'}, status=HTTP_200_OK)

class UpdatePwd(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, *args, **kwargs):
        curr_pwd = request.data.get('currentPwd')
        new_pwd = request.data.get('newPwd')
        cfm_pwd = request.data.get('confirmedPwd')

        if curr_pwd is None:
            return Response({'detail': 'current password empty'}, status=HTTP_400_BAD_REQUEST)
        user = request.user

        same_user = authenticate(username=user.username, password=curr_pwd)
        if same_user is None:
            return Response({'detail': 'Invalid Password'}, status=HTTP_400_BAD_REQUEST)
        
        if new_pwd is None:
            return Response({'detail': 'new password empty'}, status=HTTP_400_BAD_REQUEST)
        if cfm_pwd is None:
            return Response({'detail': 'confirmed password empty'}, status=HTTP_400_BAD_REQUEST)
        
        if new_pwd != cfm_pwd:
            return Response({'detail': 'new passwords dont match'}, status=HTTP_400_BAD_REQUEST)

        if new_pwd == curr_pwd:
             return Response({'detail': 'Old and new password can\'t be the same'}, status=HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_pwd)
        except ValidationError as e:

            if hasattr(e, 'message'):
                error_message = e.message
            else:
                error_message = e.messages

            return Response({'detail': error_message}, status=HTTP_400_BAD_REQUEST)

        user.set_password(new_pwd)
        user.save()

        return Response({'detail': 'Password changed'}, status=HTTP_200_OK)

class   UpdateAvatar(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, *args, **kwargs):
        avatar = request.FILES.get('avatar')
        user = request.user
        
        if avatar:
            user.avatar = avatar
            user.save()
            return  Response({"detail": "Updated Avatar Successfully."}, status=HTTP_200_OK)
        else:
            return Response({"detail": "Invalid Avatar."}, status=HTTP_400_BAD_REQUEST)

