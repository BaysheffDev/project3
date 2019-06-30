from django.shortcuts import render
from django.http import HttpResponse, Http404, JsonResponse
import json

from .models import Submenu, Category, Item, Topping, Order, OrderLine, OrderLineTopping

# Create your views here.
def index(request):
    context = {
        "submenus": Submenu.objects.all(),
        "categories": Category.objects.all(),
        "items": Item.objects.all(),
        "toppings": Topping.objects.all(),
    }

    return render(request, "menu/index.html", context)

# Check price of order and send back total to be confirmed
def placeorder(request):
    try:
        order = request.POST["order"]
        # orderName = request.POST["orderName"]
        orderjson = json.loads(order)
        categories = {}
        total = 0
        for category, items in orderjson.items():
            categoryObj = Category.objects.filter(name=category).values("id", "name")
            categories[category] = categoryObj[0]["name"]
            for item in items:
                name = item["name"]
                price = item["size"]
                qty = item["qty"]
                # get correct pricing according to size of item
                if price == "Sml":
                    price = "smallPrice"
                if price == "Lg":
                    price = "largePrice"
                if price == "Std":
                    price = "stdPrice"
                itemObj = Item.objects.filter(name=name, category=categoryObj[0]["id"]).values("id", "name", price)
                categories[name] = itemObj[0]["name"]
                categories[price] = itemObj[0][price]
                # categories[orderName] = orderName
                total += itemObj[0][price] * int(qty)
                # Get toppings for item if any
                toppings = item["toppings"]
                if toppings:
                    categories["toppings"] = []
                    for topping in toppings:
                        tp = Topping.objects.filter(name=topping).values("name", "category", "item", "price")
                        for i in tp:
                            if i["category"] == categoryObj[0]["id"]:
                                if i["price"]:
                                    total += i["price"] * int(qty)
                                    break
                            if i["item"] == itemObj[0]["id"]:
                                if i["price"]:
                                    total += i["price"] * int(qty)
                                    break
                        categories["toppings"].append(tp[0]["name"])
                        # categories["toppingPrice"] = tp[0]["price"]
            categories["total"] = total

        return JsonResponse({"price": total})
    except:
        raise Http404("didn't work mate")
        # Create order

def confirmorder(request):
    try:
        orderCreated = False
        order = request.POST["order"]
        orderName = request.POST["orderName"]
        orderTotal = 0
        orderjson = json.loads(order)

        # Create order
        orderObj = Order(name=orderName, total=orderTotal)
        orderObj.save()

        for category, items in orderjson.items():
            categoryObj = Category.objects.filter(name=category).values("id", "name")
            for item in items:
                name = item["name"]
                price = item["size"]
                qty = item["qty"]
                # get correct pricing according to size of item
                if price == "Sml":
                    price = "smallPrice"
                if price == "Lg":
                    price = "largePrice"
                if price == "Std":
                    price = "stdPrice"
                itemObj = Item.objects.filter(name=name, category=categoryObj[0]["id"]).values("id", "name", price)
                itemObj2 = Item.objects.get(name=name, category=categoryObj[0]["id"])
                orderTotal += itemObj[0][price] * int(qty)
                # Create orderLine
                orderLineObj = OrderLine(orderId=orderObj, itemId=itemObj2, quantity=qty)
                orderLineObj.save()
                # Get toppings for item if any
                toppings = item["toppings"]
                if toppings:
                    for topping in toppings:
                        tp = Topping.objects.filter(name=topping).values("name", "category", "item", "price")
                        for i in tp:
                            if i["category"] == categoryObj[0]["id"]:
                                # Get topping object
                                toppingObj = Topping.objects.get(name=topping, category=categoryObj[0]["id"])
                                # Create OrderLineTopping
                                orderLineToppingObj = OrderLineTopping(orderLineId=orderLineObj, topping=toppingObj)
                                orderLineToppingObj.save()
                                # orderLineToppingObj.topping.add(toppingObj)
                                if i["price"]:
                                    orderTotal += i["price"] * int(qty)
                                    break
                            if i["item"] == itemObj[0]["id"]:
                                # Get topping object
                                toppingObj = Topping.objects.get(name=topping, item=itemObj[0]["id"])
                                # Create OrderLineTopping
                                orderLineToppingObj = OrderLineTopping(orderLineId=orderLineObj, topping=toppingObj)
                                orderLineToppingObj.save()

                                if i["price"]:
                                    orderTotal += i["price"] * int(qty)
                                    break
        saveOrderTotal = Order.objects.filter(pk=orderObj.id)
        for obj in saveOrderTotal:
            obj.total = orderTotal
            obj.save()

        print(orderObj)
        # print(itemObj2)
        # print(orderLineObj)
        # print(orderLineToppingObj)
        # print(toppingObj)
        return JsonResponse({"success": orderObj.id, "total": orderTotal})
    except:
        raise Http404("didn't work mate")

def adminorders(request):
    orders = Order.objects.all()
    orderCollection = []
    obj = {}
    for order in orders:
        obj = {}
        name = order.name
        obj["id"] = order.id
        obj["name"] = order.name
        obj["total"] = order.total
        obj["created"] = order.created
        obj["status"] = order.status
        orderLinesList = []
        # get orderlines for this orderlines
        orderObj = Order.objects.get(pk=order.id)
        print(orderObj)
        orderLines = orderObj.items.all().values("itemId")
        print("====================================")
        print(orderLines)
        print("++++++++++++++++++++++++++++++++++++++")
        OL_Container = {}
        for line in orderLines:
            # orderLineItem = Item.objects.filter(pk=line.itemId).values("name")
            print("!!!!! ", line)
            # OL_Container["itemName"] = orderLineItem[0]["name"]
            # # print(OL_Container["itemId"])
            # OL_Container["quantity"] = line.quantity
            # orderLinesList.append(OL_Container)
            # obj["orderlines"] = orderLinesList
        orderCollection.append(obj)

    print(orders)
    return JsonResponse({"orderCollection": orderCollection})

def test(request):
    order=request.POST["order"]
    obj = json.loads(order)
    return JsonResponse(obj)
