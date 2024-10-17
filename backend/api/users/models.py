from django.db import models
from django.contrib.auth.models import AbstractUser

# The following is the User Model we are going with.

class UserProfile(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bar_exp_game1 = models.PositiveIntegerField(default=0)
    bar_exp_game2 = models.PositiveIntegerField(default=0)
    biography = models.TextField(blank=True, null=True)
    verification_code = models.CharField(max_length=64, blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    # username, email, password as well as userid are already inherited from AbstractUser

    def __str__(self):
        return self.username

    # The following class is just for easier visualisation done by the admin
    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    