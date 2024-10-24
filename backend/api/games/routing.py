from django.urls import re_path
from .consumers import GameConsumer

websocket_urlpatterns = [
    re_path('ws/game/(?P<room_name>\w+)/$', GameConsumer.as_asgi()),        
]
