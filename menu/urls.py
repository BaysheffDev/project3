from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
    path('placeorder', views.placeorder),
    path('confirmorder', views.confirmorder),
    path('adminorders', views.adminorders),
    path('test', views.test),
]
