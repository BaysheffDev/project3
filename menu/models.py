from django.db import models

# Create your models here.

class Order(models.Model):
    name = models.CharField(max_length=64)
    lineItem = models.ManyToManyField(Item)
    total = models.DecimalField(decimal_places=2)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order name: {self.name}, total: {self.total}, created: {self.created}"

class Item(models.Model):
    type = models.CharField(max_length=64)
    name = model.CharField(max_length=64)
    addOns = model.ManyToManyField(Item, blank=True, related_name="parentItem")
    addOn = model.BooleanField(default=False)

    def __str__(self):
        return f"type: {self.type}, name: {self.name}, addOn: {self.addOn}"
