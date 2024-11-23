from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST,
    HTTP_409_CONFLICT
)
from users.models import UserProfile
from users.serializers import UserProfileSerializer
from chats.models import Friend, Message
from chats.serializers import FriendSerializer
from games.models import PongGame
import re

class HomePageView(generics.RetrieveAPIView):

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_data = UserProfileSerializer(request.user).data       
        pending_friends = Friend.objects.filter(user=request.user, status='PENDING')
        accepted_friends = Friend.objects.filter(friend=request.user, status='FRIENDS')
        friends = pending_friends | accepted_friends
        friends = friends.distinct()
        friends_data = FriendSerializer(friends, many=True).data
        return Response({'status':'success', 'user':user_data, 'friends': friends_data}, status=HTTP_200_OK)

class SearchUserView(generics.RetrieveAPIView):

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get(self, request):
        query = request.GET.get('search-user-input')
        if not query:
            return Response({'status':'success', 'results':None}, status=HTTP_200_OK)    
        result = UserProfile.objects.filter(username__iexact=query).first()
        if result and not re.match(r"^\[Deleted_User\d+\]$", result.username):
            serializer = self.serializer_class(result)
            return Response({'status':'success', 'user':serializer.data}, status=HTTP_200_OK)
        else:
            return Response({'status':'success', 'user':None}, status=HTTP_200_OK)

class UpdateUNameView(generics.RetrieveAPIView):

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        uname = request.data.get('username')
        if uname is None:
            return Response({'status':'error', 'detail':'Username empty'}, status=HTTP_400_BAD_REQUEST)
        if UserProfile.objects.filter(username=uname).exists():
            return Response({'status':'error', 'detail':'Username already in use'}, status=HTTP_409_CONFLICT)
        curr_user = request.user
        curr_user.username = uname
        curr_user.save()
        return Response({'status':'success', 'detail':'Username changed'}, status=HTTP_200_OK)

class UpdateBioView(generics.RetrieveAPIView):

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        new_bio = request.data.get('bio')
        if new_bio is None:
            return Response({'status':'error', 'detail':'Bio empty'}, status=HTTP_400_BAD_REQUEST)
        curr_user = request.user
        curr_user.biography = new_bio
        curr_user.save()
        return Response({'status':'success', 'detail':'Bio changed'}, status=HTTP_200_OK)

class UpdatePrivacyView(generics.RetrieveAPIView):

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        consent = request.data.get('consent')
        password = request.data.get('password')

        delUser = authenticate(username=request.user.username, password=password)
        if delUser is None:
            return Response({'status':'error', 'detail':'Password Is Incorrect'}, status=HTTP_400_BAD_REQUEST)
        
        if consent == True:
            return Response({'status':'success', 'detail':'Privacy Policy Updated'}, status=HTTP_200_OK)
        else:
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

class DeleteMessagesView(generics.RetrieveAPIView):
    
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        target = request.data.get('target')
        password = request.data.get('password')
        user_check = authenticate(username=request.user.username, password=password)
        if user_check is None:
            return Response({'status':'error', 'detail':'Password Is Incorrect'}, status=HTTP_400_BAD_REQUEST)
        try:
            if target:
                target_user = get_object_or_404(UserProfile, username=target)
                deleted_count, _ = Message.objects.filter(sender=user, target_user=target_user).delete()
                return Response({'status': 'success', 'detail': f'Deleted {deleted_count} messages.'}, status=HTTP_200_OK)
            else:
                deleted_count, _ = Message.objects.filter(sender=user).delete()
                return Response({'status': 'success', 'detail': f'Deleted {deleted_count} messages.'}, status=HTTP_200_OK)
        except Exception as e:
            return Response({'status': 'error', 'detail': str(e)}, status=HTTP_400_BAD_REQUEST)

class DeleteGamesView(generics.RetrieveAPIView):

    permission_classes = [permissions.IsAuthenticated]
        
    def post(self, request):
        user = request.user
        password = request.data.get('password')
        user_check = authenticate(username=request.user.username, password=password)
        if user_check is None:
            return Response({'status':'error', 'detail':'Password Is Incorrect'}, status=HTTP_400_BAD_REQUEST)
        try:
            games_to_reset = PongGame.objects.filter(user=user)
            games_to_reset.update(
                score = 0,
                attack_accuracy = 0,
                shield_powerup = 0,
            )
        except Exception as e:
            return Response({'status':'error', 'detail':str(e)}, status=HTTP_400_BAD_REQUEST)            
        return Response({'status':'success', 'detail':'Erased Game Records successfuly'}, status=HTTP_200_OK)            

class UpdateEmailView(generics.RetrieveAPIView):

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        new_email = request.data.get('email')
        user = request.user
        if new_email is None or '@' not in new_email or '.' not in new_email:            
            return Response({'status':'error', 'detail':'Invalid Email!{new_email}'}, status=HTTP_400_BAD_REQUEST)
        try:
            subject = 'Email Update'
            message = f'You have updated your email from {user.email} to {new_email}!'
            send_mail(subject, message, settings.EMAIL_HOST_USER, [new_email])
        except Exception as e:
            return Response({'status':'error', 'detail':'Email Could not be reached'}, status=HTTP_400_BAD_REQUEST)
        
        try:
            existing_user = UserProfile.objects.get(email=new_email)
            if existing_user is not None:
                return Response({'status':'error', 'detail':'Email Already In Use'}, status=HTTP_400_BAD_REQUEST)
        except ObjectDoesNotExist:
            pass
        user.email = new_email
        user.save()
        return Response({'status':'success', 'detail':'Email Changed Successfuly'}, status=HTTP_200_OK)


class UpdatePwdView(generics.RetrieveAPIView):

    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        curr_pwd = request.data.get('currentPwd')
        new_pwd = request.data.get('newPwd')
        cfm_pwd = request.data.get('confirmedPwd')
        if curr_pwd is None:
            return Response({'status':'error', 'detail':'current password empty'}, status=HTTP_400_BAD_REQUEST)
        user = request.user
        same_user = authenticate(username=user.username, password=curr_pwd)
        if same_user is None:
            return Response({'status':'error', 'detail':'Invalid Password'}, status=HTTP_400_BAD_REQUEST)
        if new_pwd is None:
            return Response({'status':'error', 'detail':'new password empty'}, status=HTTP_400_BAD_REQUEST)
        if cfm_pwd is None:
            return Response({'status':'error', 'detail':'confirmed password empty'}, status=HTTP_400_BAD_REQUEST)
        if new_pwd != cfm_pwd:
            return Response({'status':'error', 'detail':'new passwords dont match'}, status=HTTP_400_BAD_REQUEST)
        if new_pwd == curr_pwd:
             return Response({'status':'error', 'detail':'Old and new password can\'t be the same'}, status=HTTP_400_BAD_REQUEST)
        try:
            validate_password(new_pwd)

        except ValidationError as e:
            if hasattr(e, 'message'):
                error_message = e.message
            else:
                error_message = e.messages
            return Response({'status':'error', 'detail':error_message}, status=HTTP_400_BAD_REQUEST)

        user.set_password(new_pwd)
        user.save()
        return Response({'status':'success', 'detail':'Password changed'}, status=HTTP_200_OK)

class   UpdateAvatarView(generics.GenericAPIView):

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        avatar = request.FILES.get('avatar')
        user = request.user
        if avatar:
            user.avatar = avatar
            user.save()
            return  Response({'status':'success', 'detail':'Updated Avatar Successfully'}, status=HTTP_200_OK)
        else:
            return Response({'status':'error', 'detail':'Invalid Avatar'}, status=HTTP_400_BAD_REQUEST)

class   UpdateTwoFactorAuthView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        if user.Twofa_auth == False:
            user.Twofa_auth = True
        else:
            user.Twofa_auth = False
        user.save()
        return Response({'status':'success', 'detail':'Changed Two_Factor_Auth Status'}, status=HTTP_200_OK)