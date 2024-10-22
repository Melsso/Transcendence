from django.urls import path
from .views import MatchHistoryView

urlpatterns = [
    path('api/games/match-history/', MatchHistoryView.as_view(), name='match_history'),
	path('api/games/match-history/<str:uname>/', MatchHistoryView.as_view(), name='match_history_by_uname')
	
]
