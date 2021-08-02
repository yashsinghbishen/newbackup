from django.shortcuts import render
from django.core import serializers
from django.http import JsonResponse
from django.contrib.postgres.aggregates import ArrayAgg
from django.db.models import Case, Q, Value, F, When, TextField, OuterRef
from test_app.models import *
from psycopg2.extras import Json
from django.forms.models import model_to_dict
from rest_framework import viewsets

def get_orders(request):
    orders = Order.objects.filter(
        status__paid=True
    ).annotate(
        products=ArrayAgg(
            Case(
                When(   
                    ~Q(order__product=None), 
                    then=F('order__product__product_name')
                ),
                default=F('order__p__product_name'),
                output_field=TextField()
            )
        )        
    ).values(
        'customer__first_name',
        'customer__last_name',
        'customer__email__email_address',
        'order_number',
        'products',
    )
    return render(request, 'test_view.html', context={'orders':orders})