from django.urls import path
from .views import MatchHistoryView, CreateGameRoomView, CreateTournamentRoomView, GameResultView

urlpatterns = [
   path('api/games/match-history/', MatchHistoryView.as_view(), name='match_history'),
	path('api/games/match-history/<str:uname>/', MatchHistoryView.as_view(), name='match_history_by_uname'),
	path('api/games/create-game-room/', CreateGameRoomView.as_view(), name='create_game_room'),
	path('api/games/create-tournament-room/', CreateTournamentRoomView.as_view(), name='create_tournament_room'),
	path('api/games/game_result/', GameResultView.as_view(), name='game_result')
]
