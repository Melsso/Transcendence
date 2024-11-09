from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
)
from .models import KnownHost, KnownDevice
from .serializers import KnownHostSerializer, KnownDeviceSerializer
from users.serializers import UserProfileSerializer
from users.utils import generate_verification_code
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
			return Response({'status':'Known', 'detail':'The Host Is Known','2fa': nonvali}, status=HTTP_200_OK)
		veri_code = generate_verification_code()
		subject = 'Your Login Code'
		message = f'Your login code is: {veri_code}'
		send_mail(subject, message, settings.EMAIL_HOST_USER, [user.email])
		user.verification_code = veri_code
		user.save()
		vali = True
		return Response({'status':'Unknown', 'detail':'The Host Is Not Known','2fa': vali}, status=HTTP_200_OK)

	def post(self, request, *args, **kwargs):
		user = request.user
		ip_addr = self.get_client_ip(request)
		user_agent = request.META.get('HTTP_USER_AGENT')
		code = request.data.get('code')
		remember = request.data.get('remember')
		if code != user.verification_code:
			return Response({'status':'error', 'detail':'Wrong Verification Code!'}, status=HTTP_401_UNAUTHORIZED)
		user.verification_code = ''
		user.save()
		is_known_host = KnownHost.objects.filter(user=user, ip_address=ip_addr).exists()
		is_known_device = KnownDevice.objects.filter(user=user, user_agent=user_agent).exists()
		if not is_known_host and remember:
			known_host_data = { 'user': user.id, 'ip_address': ip_addr }
			host_seri = KnownHostSerializer(data=known_host_data)
			if host_seri.is_valid():
				host_seri.save()
			else:
				return Response({'status':'error', 'detail':host_seri.errors}, status=HTTP_400_BAD_REQUEST)
		if not is_known_device and remember:
			known_userAgent_data = { 'user': user.id, 'user_agent': user_agent }
			device_seri = KnownDeviceSerializer(data=known_userAgent_data)
			if device_seri.is_valid():
				device_seri.save()
			else:
				return Response({'status':'error', 'detail': device_seri.errors}, status=HTTP_400_BAD_REQUEST)
		if remember:
			return Response({'status': 'success', 'detail': 'Host And Device Saved'}, status=HTTP_200_OK)
		return Response({'status': 'success', 'detail': 'Host And Device Not Remembered'}, status=HTTP_200_OK)
	
	def get_client_ip(self, request):
		x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
		if x_forwarded_for:
			ip = x_forwarded_for.split(',')[0]
		else:
			ip = request.META.get('REMOTE_ADDR')
		return ip