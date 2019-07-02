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
        raise Http404("Failed to validate order")
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
                orderLineTotal =  itemObj[0][price] * int(qty)
                # Get toppings for item if any
                toppings = item["toppings"]
                if toppings:
                    for topping in toppings:
                        tp = Topping.objects.filter(name=topping).values("name", "category", "item", "price")
                        orderLineTotal = itemObj[0][price] * int(qty)
                        for i in tp:
                            if i["category"] == categoryObj[0]["id"]:
                                # Get topping object
                                toppingObj = Topping.objects.get(name=topping, category=categoryObj[0]["id"])
                                # Create OrderLineTopping
                                orderLineToppingObj = OrderLineTopping(orderLineId=orderLineObj, topping=toppingObj)
                                orderLineToppingObj.save()
                                if i["price"]:
                                    orderTotal += i["price"] * int(qty)
                                    orderLineTotal += i["price"] * int(qty)
                                # Add subtotal price of orderItem including toppings
                                saveOrderLineTotal = OrderLine.objects.filter(pk=orderLineObj.id)
                                for obj in saveOrderLineTotal:
                                    obj.price = orderLineTotal
                                    obj.save()
                                break
                            if i["item"] == itemObj[0]["id"]:
                                # Get topping object
                                toppingObj = Topping.objects.get(name=topping, item=itemObj[0]["id"])
                                # Create OrderLineTopping
                                orderLineToppingObj = OrderLineTopping(orderLineId=orderLineObj, topping=toppingObj)
                                orderLineToppingObj.save()
                                if i["price"]:
                                    orderTotal += i["price"] * int(qty)
                                    orderLineTotal += i["price"] * int(qty)
                                # Add subtotal price of orderItem including toppings
                                saveOrderLineTotal = OrderLine.objects.filter(pk=orderLineObj.id)
                                for obj in saveOrderLineTotal:
                                    obj.price = orderLineTotal
                                    obj.save()
                                break
                else:
                    # Add subtotal price of orderItem with no toppings
                    saveOrderLineTotal = OrderLine.objects.filter(pk=orderLineObj.id)
                    for obj in saveOrderLineTotal:
                        obj.price = orderLineTotal
                        obj.save()
        saveOrderTotal = Order.objects.filter(pk=orderObj.id)
        for obj in saveOrderTotal:
            obj.total = orderTotal
            obj.save()

        return JsonResponse({"success": orderObj.id, "total": orderTotal})
    except:
        raise Http404("didn't work mate")

def adminorders(request):
    orders = Order.objects.all()
    orderCollection = []
    o = {}
    for order in orders:
        o = {}
        name = order.name
        o["id"] = order.id
        o["name"] = order.name
        o["total"] = order.total
        o["created"] = order.created
        o["status"] = order.status
        orderLinesList = []
        # Get orderlines for this order
        orderObj = Order.objects.get(pk=order.id)
        orderLines = orderObj.items.all().values("id", "itemId", "price", "quantity")
        OL_Container = {}
        for line in orderLines:
            itemName = Item.objects.filter(pk=line["itemId"]).values("name", "category")
            OL_Container["itemCategory"] = itemName[0]["category"]
            OL_Container["itemName"] = itemName[0]["name"]
            OL_Container["qty"] = line["quantity"]
            OL_Container["linePrice"] = line["price"]
            orderLineObj = OrderLine.objects.get(pk=line["id"])
            # Get toppinglines for this orderline
            toppingLines = orderLineObj.toppings.all().values("topping")
            toppingLinesList = []
            for topping in toppingLines:
                toppingName = Topping.objects.filter(pk=topping["topping"]).values("name")
                toppingLinesList.append(toppingName[0]["name"])
            OL_Container["toppings"] = toppingLinesList
            orderLinesList.append(OL_Container)
            OL_Container = {}
        o["orderLines"] = orderLinesList
        orderCollection.append(o)

    # return JsonResponse({"orderCollection": orderCollection})
    context = {
        "orders": orderCollection,
    }

    # ordercollection representation
    # = [
    #     {
    #         "id":
    #         "name":
    #         "total":
    #         "created":
    #         "status":
    #         "orderLines": [
    #             "itemCategory":
    #             "itemName":
    #             "qty":
    #             "linePrice":
    #             "toppings": [
    #                 #name
    #             ]
    #         ]
    #     },
    #     {
    #      # next order
    #     },
    # ]

    return render(request, "menu/orders.html", context)

def test(request):
    order=request.POST["order"]
    obj = json.loads(order)
    return JsonResponse(obj)
