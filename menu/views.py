from django.shortcuts import render
from django.http import HttpResponse, Http404, JsonResponse
import json

from .models import Submenu, Category, Item, Topping, Order, OrderLine

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
    try:
        order = request.POST["order"]
        orderjson = json.loads(order)
        obj = {}
        for key, value in orderjson.items():
            obj[key] = value
        return JsonResponse(obj)
    except:
        raise Http404("didn't work mate")
