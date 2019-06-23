from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

from .models import Submenu, Category, Item, Topping

# Create your views here.
def index(request):
    context = {
        "submenus": Submenu.objects.all(),
        "categories": Category.objects.all(),
        "items": Item.objects.all(),
        "toppings": Topping.objects.all(),
    }

    return render(request, "menu/index.html", context)

def placeorder(request):
    totalPrice = {
        "name": "alex",
    }
    return JsonResponse(totalPrice)
