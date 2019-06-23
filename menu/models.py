from django.db import models

class Submenu(models.Model):
    name = models.CharField(max_length=64)

    def __str__(self):
        return f"{self.name}"

class Category(models.Model):
    name = models.CharField(max_length=64)
    submenu = models.ForeignKey(Submenu, blank=True, null=True, on_delete=models.CASCADE, related_name="categories")
    sizes = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name}"

class Item(models.Model):
    name = models.CharField(max_length=64)
    category = models.ForeignKey(Category, blank=True, on_delete=models.CASCADE, related_name="items")
    stdPrice = models.DecimalField(decimal_places=2, max_digits=5, blank=True, null=True)
    smallPrice = models.DecimalField(decimal_places=2, max_digits=5, blank=True, null=True)
    largePrice = models.DecimalField(decimal_places=2, max_digits=5, blank=True, null=True)

    def __str__(self):
        return f"{self.name}, {self.category}, {self.stdPrice}, {self.smallPrice}, {self.largePrice}"

class Topping(models.Model):
    name = models.CharField(max_length=64)
    category = models.ForeignKey(Category, blank=True, null=True, on_delete=models.CASCADE, related_name="categoryToppings")
    item = models.ManyToManyField(Item, blank=True, related_name="itemToppings")
    price = models.DecimalField(decimal_places=2, max_digits=5, blank=True, null=True)

    def __str__(self):
        return f"{self.name}, {self.category}, {self.item}, {self.price}"

class Order(models.Model):
    name = models.CharField(max_length=64)
    total = models.DecimalField(decimal_places=2, max_digits=6)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name}, {self.total}, {self.created}"

class OrderLine(models.Model):
    orderId = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    itemId = models.ManyToManyField(Item, blank=True, related_name="orders")
    topping = models.ManyToManyField(Topping, blank=True, related_name="orders")

    def __str__(self):
        return f"{self.orderId}, {self.itemId}, {self.topping}"
