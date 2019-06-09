from django.contrib import admin

from .models import Submenu, Category, Item, Topping, Order, OrderLine

# Register your models here.
admin.site.register(Submenu)
admin.site.register(Category)
admin.site.register(Item)
admin.site.register(Topping)
admin.site.register(Order)
admin.site.register(OrderLine)
