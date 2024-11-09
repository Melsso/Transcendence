import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')

def get_websocket_urlpatterns():
    chats_routing = __import__('chats.routing').routing.websocket_urlpatterns
    games_routing = __import__('games.routing').routing.websocket_urlpatterns
    return chats_routing + games_routing
def get_wrapper():
    return __import__('games.middleware').middleware.JWTAuthMiddleware

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": get_wrapper()( 
        AuthMiddlewareStack(
            URLRouter(
                get_websocket_urlpatterns()
            )  
        )
    ),
})
