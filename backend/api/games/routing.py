from django.urls import re_path
from .consumers import GameConsumer, TournamentConsumer

websocket_urlpatterns = [
    re_path(r'ws/game/(?P<room_name>[-\w]+)/$', GameConsumer.as_asgi()),        
    re_path(r'ws/tournament/(?P<tournament_room_name>[-\w]+)/$', TournamentConsumer.as_asgi()),
]
