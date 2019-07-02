from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('placeorder', views.placeorder, name="placeorder"),
    path('confirmorder', views.confirmorder, name="confirmorder"),
    path('adminorders', views.adminorders, name="adminorders"),
    path('test', views.test),
]
