from django.urls import path
from .consumers import random

websocket_urlpatterns = [
    path('ws/', random.as_asgi()),        
]
