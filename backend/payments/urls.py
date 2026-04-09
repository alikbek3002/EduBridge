from django.urls import path
from . import views

urlpatterns = [
    path('plans/', views.SubscriptionPlanListView.as_view(), name='subscription-plan-list'),
    path('subscriptions/', views.UserSubscriptionListView.as_view(), name='user-subscription-list'),
    path('subscriptions/<int:pk>/', views.UserSubscriptionDetailView.as_view(), name='user-subscription-detail'),
    path('payments/', views.PaymentListView.as_view(), name='payment-list'),
    path('payments/<int:pk>/', views.PaymentDetailView.as_view(), name='payment-detail'),
    path('invoices/', views.InvoiceListView.as_view(), name='invoice-list'),
    path('invoices/<int:pk>/', views.InvoiceDetailView.as_view(), name='invoice-detail'),
    path('create-payment/', views.create_payment, name='create-payment'),
    path('current-subscription/', views.current_subscription, name='current-subscription'),
]
