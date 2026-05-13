from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status

from accounts.models import UserProfile
from .models import SubscriptionPlan, UserSubscription, Payment, Invoice

User = get_user_model()


def make_user(email='pay@test.com', password='TestPass123!'):
    user = User.objects.create_user(
        username=email.split('@')[0],
        email=email,
        password=password,
        first_name='Pay',
        last_name='Test',
    )
    UserProfile.objects.get_or_create(user=user)
    return user


def make_plan(name='Basic', price='9.99', duration_days=30):
    return SubscriptionPlan.objects.create(
        name=name,
        description='Basic plan',
        price=price,
        currency='EUR',
        duration_days=duration_days,
        is_active=True,
    )


# --------------- Subscription Plans ---------------

class SubscriptionPlanTests(APITestCase):
    def setUp(self):
        self.user = make_user()
        make_plan('Starter')
        make_plan('Pro', '19.99')

    def test_list_plans_authenticated(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.get('/api/payments/plans/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data), 2)

    def test_list_plans_unauthenticated_returns_401(self):
        resp = self.client.get('/api/payments/plans/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


# --------------- Create Payment ---------------

class CreatePaymentTests(APITestCase):
    URL = '/api/payments/create-payment/'

    def setUp(self):
        self.user = make_user(email='createpay@test.com')
        self.plan = make_plan()
        self.client.force_authenticate(user=self.user)

    def test_create_payment_success(self):
        resp = self.client.post(self.URL, {'plan_id': self.plan.id, 'payment_method': 'card'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('payment', resp.data)
        self.assertIn('subscription', resp.data)
        self.assertIn('invoice', resp.data)

    def test_payment_status_is_completed(self):
        resp = self.client.post(self.URL, {'plan_id': self.plan.id}, format='json')
        self.assertEqual(resp.data['payment']['status'], 'completed')

    def test_payment_creates_subscription(self):
        self.client.post(self.URL, {'plan_id': self.plan.id}, format='json')
        self.assertTrue(UserSubscription.objects.filter(user=self.user, plan=self.plan).exists())

    def test_payment_creates_invoice(self):
        resp = self.client.post(self.URL, {'plan_id': self.plan.id}, format='json')
        payment_id = resp.data['payment']['id']
        self.assertTrue(Invoice.objects.filter(payment_id=payment_id, is_paid=True).exists())

    def test_create_payment_invalid_plan(self):
        resp = self.client.post(self.URL, {'plan_id': 99999}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_payment_unauthenticated(self):
        self.client.force_authenticate(user=None)
        resp = self.client.post(self.URL, {'plan_id': self.plan.id}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


# --------------- Current Subscription ---------------

class CurrentSubscriptionTests(APITestCase):
    URL = '/api/payments/current-subscription/'

    def setUp(self):
        self.user = make_user(email='cursub@test.com')
        self.plan = make_plan()
        self.client.force_authenticate(user=self.user)

    def test_no_active_subscription_returns_404(self):
        resp = self.client.get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_active_subscription_returned(self):
        UserSubscription.objects.create(
            user=self.user,
            plan=self.plan,
            end_date=timezone.now() + timezone.timedelta(days=30),
            is_active=True,
        )
        resp = self.client.get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('plan', resp.data)

    def test_expired_subscription_returns_404(self):
        UserSubscription.objects.create(
            user=self.user,
            plan=self.plan,
            end_date=timezone.now() - timezone.timedelta(days=1),
            is_active=True,
        )
        resp = self.client.get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)


# --------------- Invoices ---------------

class InvoiceTests(APITestCase):
    URL = '/api/payments/invoices/'

    def setUp(self):
        self.user = make_user(email='invoice@test.com')
        self.plan = make_plan()
        self.client.force_authenticate(user=self.user)

    def test_list_invoices_empty(self):
        resp = self.client.get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 0)

    def test_invoice_listed_after_payment(self):
        self.client.post('/api/payments/create-payment/', {'plan_id': self.plan.id}, format='json')
        resp = self.client.get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)
        self.assertTrue(resp.data[0]['is_paid'])
