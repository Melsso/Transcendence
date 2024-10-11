from django.db import models
from django.conf import settings


# Create your models here.

class Chat(models.Model):

    user1 = models.ForeignKey(settings.AUTH_USER_MODEL, 
        related_name='chat_user1',
        on_delete=models.CASCADE
    )
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, 
        related_name='chat_user2',
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat between {self.user1.username} and {self.user2.username}"

    class Meta:
        unique_together = ('user1', 'user2')


class Message(models.Model):

    chat = models.ForeignKey(Chat,
        related_name='messages',
        on_delete=models.CASCADE
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message {self.id} from {self.sender.username} in chat {self.chat.id}"

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