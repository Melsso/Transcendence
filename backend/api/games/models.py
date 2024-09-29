from django.db import models
from django.conf import settings

# Create your models here.

class Game(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    opponenet = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="%(class)s_opponent"
    )
    is_win = models.BooleanField(default=False)
    date_played = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.__class__.__name__} {self.id}: {self.user.username} vs {self.opponenet.username if self.opponenet else 'AI'}"

    class Meta:
        abstract = True

class PongGame(Game):
    score = models.IntegerField(default=0)
    attack1_accuracy = models.IntegerField(default=0)
    attack2_accuracy = models.IntegerField(default=0)
    map_name = models.TextField()
    shield_powerup = models.IntegerField(default=0)
class RrGame(Game):
    score = models.IntegerField(default=0)