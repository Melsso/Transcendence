from django.urls import path
from .consumers import PongConsumer, ChatConsumer

websocket_urlpatterns = [
    path('ws/pong/<str:room_name>/', PongConsumer.as_asgi()),  
    path('ws/chat/<str:room_name>/', ChatConsumer.as_asgi()), 
]