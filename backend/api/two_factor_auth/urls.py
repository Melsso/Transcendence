from django.urls import path
from .views import CheckKnownHostDeviceView

urlpatterns = [
    path('api/new-entity/', CheckKnownHostDeviceView.as_view(), name='new-entity'),
]