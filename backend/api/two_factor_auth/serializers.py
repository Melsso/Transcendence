from rest_framework import serializers
from .models import KnownHost, KnownDevice

class KnownHostSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnownHost
        fields = ['user', 'ip_address']

class KnownDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnownDevice
        fields = ['user', 'user_agent']