from django.db import models
from django.contrib.auth.models import AbstractUser

class UserProfile(AbstractUser):

    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bar_exp_game1 = models.PositiveIntegerField(default=0)
    biography = models.TextField(blank=True, null=True)
    verification_code = models.CharField(max_length=64, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    Twofa_auth = models.BooleanField(default=False)

    def __str__(self):
        return self.username

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    