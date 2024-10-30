from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_201_CREATED,
    HTTP_200_OK,
    HTTP_205_RESET_CONTENT,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_401_UNAUTHORIZED,
    HTTP_500_INTERNAL_SERVER_ERROR,
    HTTP_409_CONFLICT
)
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from users.serializers import UserProfileSerializer
from users.utils import generate_verification_code
from users.models import UserProfile
from .models import KnownHost, KnownDevice
from .serializers import KnownHostSerializer, KnownDeviceSerializer
from django.conf import settings
from django.core.mail import send_mail

class CheckKnownHostDeviceView(generics.GenericAPIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request, *args, **kwargs):
		user = request.user
		ip_addr = self.get_client_ip(request)
		user_agent = request.META.get('HTTP_USER_AGENT')

		is_known_host = KnownHost.objects.filter(user=user, ip_address=ip_addr).exists()
		is_known_device = KnownDevice.objects.filter(user=user, user_agent=user_agent).exists()
		nonvali = False
		if is_known_device and is_known_host:
			return Response({'status': 'Known', '2fa': nonvali}, status=HTTP_200_OK)
		
		veri_code = generate_verification_code()
		subject = 'Your Login Code'
		message = f'Your login code is: {veri_code}'
		send_mail(subject, message, settings.EMAIL_HOST_USER, [user.email])
		user.verification_code = veri_code
		user.save()
		vali = True
		Response({'status': 'Unknown', '2fa': vali}, status=HTTP_200_OK)

	def post(self, request, *args, **kwargs):
		user = request.user
		ip_addr = self.get_client_ip()
		user_agent = request.META.get('HTTP_USER_AGENT')
		code = request.data.get('code')
		remember = request.data.get('remember')

		if code != user.verification_code:
			return Response({'detail': 'Wrong Verification Code!'}, status=HTTP_401_UNAUTHORIZED)

		user.verification_code = ''
		user.save()
		is_known_host = KnownHost.objects.filter(user=user, ip_address=ip_addr).exists()
		is_known_device = KnownDevice.objects.filter(user=user, user_agent=user_agent).exists()
		if not is_known_host and remember:
			known_host_data = {
				'user': user.id,
				'ip_address': ip_addr
			}
			host_seri = KnownHostSerializer(data=known_host_data)
			if host_seri.is_valid():
				host_seri.save()
			else:
				return Response({'status': 'Error', 'Error': host_seri.errors}, status=HTTP_400_BAD_REQUEST)
		if not is_known_device and remember:
			known_userAgent_data = {
				'user': user.id,
				'user_agent': user_agent
			}
			device_seri = KnownDeviceSerializer(data=known_userAgent_data)
			if device_seri.is_valid():
				device_seri.save()
			else:
				return Response({'status': 'Error', 'Error': device_seri.errors}, status=HTTP_400_BAD_REQUEST)
		if remember:
			return Response({'status': 'success', 'message': 'Host And Device Saved'}, status=HTTP_200_OK)
		return Response({'status': 'success', 'message': 'Host And Device Not Remembered'}, status=HTTP_200_OK)
	
	def get_client_ip(self, request):
		x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
		if x_forwarded_for:
			ip = x_forwarded_for.split(',')[0]
		else:
			ip = request.META.get('REMOTE_ADDR')
		return ip

