from django.contrib import admin
from .models import *
# Register your models here.

admin.site.register(Email)
admin.site.register(Customer)
admin.site.register(OrderStatus)
admin.site.register(CustomProduct)
admin.site.register(NonCustomProduct)
admin.site.register(Order)
admin.site.register(OrderItem)