from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

# Create your views here.
def index(request):
    context = {
        "menu": "A pizza"
    }

    return JsonResponse(context)
