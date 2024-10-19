from django.db import models
from django.conf import settings

class Message(models.Model):

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='private_messages'
    )

    def __str__(self):
        if self.target_user:
            return f"Message from {self.sender.username} to {self.target_user.id}"
        return f"Global message from {self.sender.username}"

    class Meta:
        ordering = ['timestamp']
    
class Friend(models.Model):
    FRIEND_STATUS_CHOICES = [
        ('FRIENDS', 'Friends'),
        ('PENDING', 'Pending'),
        ('BLOCKED', 'Blocked'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL,
        related_name="friends",
        on_delete=models.CASCADE
    )
    
    friend = models.ForeignKey(settings.AUTH_USER_MODEL,
        related_name="friend_of",
        on_delete=models.CASCADE
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=10,
        choices=FRIEND_STATUS_CHOICES,
        default='PENDING'
    )

    def __str__(self):
        return f"{self.user.username} is friends with {self.friend.username}"

    class Meta:
        unique_together = ('user', 'friend')
        ordering = ['created_at']