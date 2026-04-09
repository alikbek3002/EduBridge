from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
import uuid

from .models import SubscriptionPlan, UserSubscription, Payment, Invoice
from .serializers import (
    SubscriptionPlanSerializer, UserSubscriptionSerializer,
    PaymentSerializer, InvoiceSerializer
)


class SubscriptionPlanListView(generics.ListAPIView):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserSubscriptionListView(generics.ListCreateAPIView):
    serializer_class = UserSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserSubscription.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserSubscriptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserSubscription.objects.filter(user=self.request.user)


class PaymentListView(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PaymentDetailView(generics.RetrieveAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)


class InvoiceListView(generics.ListAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Invoice.objects.filter(user=self.request.user)


class InvoiceDetailView(generics.RetrieveAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Invoice.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_payment(request):
    plan_id = request.data.get('plan_id')
    payment_method = request.data.get('payment_method', 'card')
    
    try:
        plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
    except SubscriptionPlan.DoesNotExist:
        return Response({'error': 'План подписки не найден'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Создаем подписку
    end_date = timezone.now() + timezone.timedelta(days=plan.duration_days)
    subscription = UserSubscription.objects.create(
        user=request.user,
        plan=plan,
        end_date=end_date
    )
    
    # Создаем платеж
    transaction_id = str(uuid.uuid4())
    payment = Payment.objects.create(
        user=request.user,
        subscription=subscription,
        amount=plan.price,
        currency=plan.currency,
        payment_method=payment_method,
        transaction_id=transaction_id,
        status='completed'  # В реальном приложении здесь будет интеграция с платежной системой
    )
    
    # Создаем счет
    invoice_number = f"INV-{timezone.now().strftime('%Y%m%d')}-{payment.id}"
    invoice = Invoice.objects.create(
        user=request.user,
        payment=payment,
        invoice_number=invoice_number,
        due_date=timezone.now() + timezone.timedelta(days=30),
        is_paid=True
    )
    
    return Response({
        'message': 'Платеж успешно обработан',
        'payment': PaymentSerializer(payment).data,
        'subscription': UserSubscriptionSerializer(subscription).data,
        'invoice': InvoiceSerializer(invoice).data
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_subscription(request):
    try:
        subscription = UserSubscription.objects.filter(
            user=request.user,
            is_active=True,
            end_date__gt=timezone.now()
        ).latest('start_date')
        
        serializer = UserSubscriptionSerializer(subscription)
        return Response(serializer.data)
    except UserSubscription.DoesNotExist:
        return Response({'message': 'Активная подписка не найдена'}, status=status.HTTP_404_NOT_FOUND)
