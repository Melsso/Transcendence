from django.contrib import admin
from .models import PongGame, RrGame

# Register your models here.

admin.site.register(PongGame)
admin.site.register(RrGame)