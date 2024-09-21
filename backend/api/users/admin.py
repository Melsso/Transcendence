from django.contrib import admin
from .models import UserProfile

# Register your models here.

# This allows us to manage our models using the admin interface
admin.site.register(UserProfile)
