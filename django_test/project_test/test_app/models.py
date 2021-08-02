from django.db import models
from django.utils.translation import ugettext_lazy as _
# Create your models here.


class Email(models.Model):

    email_address = models.EmailField(_("email_address"), max_length=254)

    class Meta:
        verbose_name = _("Email")
        verbose_name_plural = _("Emails")

    def __str__(self):
        return self.email_address


class Customer(models.Model):

    first_name = models.TextField(_("first_name"))
    last_name = models.TextField(_("last_name"))
    email = models.ForeignKey(Email,
                              verbose_name=_("email"),
                              on_delete=models.CASCADE)

    class Meta:
        verbose_name = _("Customer")
        verbose_name_plural = _("Customers")

    def __str__(self):
        return f'{ self.first_name } { self.last_name }'


class OrderStatus(models.Model):

    paid = models.BooleanField(_("paid"))

    class Meta:
        verbose_name = _("OrderStatus")
        verbose_name_plural = _("OrderStatuss")

    def __str__(self):
        return str(self.paid)


class CustomProduct(models.Model):

    product_name = models.TextField(_("product_name"))
    price = models.DecimalField(_("price"), max_digits=6, decimal_places=2)

    class Meta:
        verbose_name = _("CustomProduct")
        verbose_name_plural = _("CustomProducts")

    def __str__(self):
        return self.product_name


class NonCustomProduct(models.Model):

    product_name = models.TextField(_("product_name"))
    price = models.DecimalField(_("price"), max_digits=6, decimal_places=2)

    class Meta:
        verbose_name = _("NonCustomProduct")
        verbose_name_plural = _("NonCustomProducts")

    def __str__(self):
        return self.product_name


class OrderItem(models.Model):

    product = models.ForeignKey(CustomProduct,
                                verbose_name=_("custom_product"),
                                on_delete=models.CASCADE,
                                null=True,
                                blank=True)
    p = models.ForeignKey(NonCustomProduct,
                          verbose_name=_("non_custom_product"),
                          on_delete=models.CASCADE,
                          null=True,
                          blank=True)

    class Meta:
        verbose_name = _("OrderItem")
        verbose_name_plural = _("OrderItems")

    def __str__(self):
        return self.product.product_name


class Order(models.Model):

    order_number = models.TextField(_("order_number"))
    customer = models.ForeignKey(Customer,
                                 verbose_name=_("customer"),
                                 on_delete=models.CASCADE)
    status = models.ForeignKey(OrderStatus,
                               verbose_name=_("status"),
                               on_delete=models.CASCADE)
    order = models.ForeignKey(OrderItem,
                              verbose_name=_("order_item"),
                              on_delete=models.CASCADE)
    class Meta:
        verbose_name = _("Order")
        verbose_name_plural = _("Orders")

    def __str__(self):
        return self.order_number


