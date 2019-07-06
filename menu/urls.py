from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('placeorder', views.placeorder, name="placeorder"),
    path('confirmorder', views.confirmorder, name="confirmorder"),
    path('orders/<str:name>', views.orders, name="orders"),
    path('changeorderstatus', views.changeorderstatus, name="changeorderstatus"),
    path('login', views.login_view, name="login"),
    path('logout', views.logout_view, name="logout"),
    path('register', views.register, name="register"),
]
