from django.db import models
from users.models import UserProfile

class KnownHost(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='known_hosts')
    ip_address = models.GenericIPAddressField()
    added_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.ip_address} for {self.user.username}"

class KnownDevice(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='known_devices')
    user_agent = models.TextField()
    added_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Device for {self.user.username}: {self.user_agent[:30]}"
