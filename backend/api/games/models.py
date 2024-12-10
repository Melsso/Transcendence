from django.db import models
from django.conf import settings
import random
import time
import string

class Game(models.Model):
    game_id = models.CharField(max_length=20, blank=True, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    opponent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="%(class)s_opponent"
    )
    is_win = models.BooleanField(default=False)
    is_forfeit = models.BooleanField(default=False)
    date_played = models.DateTimeField(auto_now_add=True)

    def generate_game_id(self):
        timestamp_part = str(int(time.time()))[-6:]
        random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))  # 10 random chars
        return f"{self.user.id}_{self.opponent.id}_{timestamp_part}_{random_part}"
    
    def save(self, *args, **kwargs):
        if not self.game_id:
            self.game_id = self.generate_game_id()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.__class__.__name__} {self.id}: {self.user.username} vs {self.opponent.username if self.opponent else 'AI'}"
    
    class Meta:
        abstract = True

class PongGame(Game):
    score = models.IntegerField(default=0)
    map_name = models.TextField()
    attack_accuracy = models.FloatField(default=0.0)
    shield_powerup = models.IntegerField(default=0)
    speed_powerup = models.IntegerField(default=0)
    #add speed powerup

    class Meta:
        unique_together = ('user', 'game_id')