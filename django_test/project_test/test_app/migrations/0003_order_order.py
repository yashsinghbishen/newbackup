# Generated by Django 3.1.7 on 2021-03-01 11:05

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('test_app', '0002_customer_email'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='order',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, to='test_app.orderitem', verbose_name='order_item'),
            preserve_default=False,
        ),
    ]
