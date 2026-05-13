from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from accounts.models import UserProfile
from .models import Notification, NotificationTemplate

User = get_user_model()


def make_user(email='notif@test.com', password='TestPass123!'):
    user = User.objects.create_user(
        username=email.split('@')[0],
        email=email,
        password=password,
        first_name='Notif',
        last_name='Test',
    )
    UserProfile.objects.get_or_create(user=user)
    return user


def make_notification(user, title='Test', message='Test message', notif_type='info'):
    return Notification.objects.create(
        user=user, title=title, message=message, notification_type=notif_type,
    )


# --------------- Notification List ---------------

class NotificationListTests(APITestCase):
    URL = '/api/notifications/'

    def setUp(self):
        self.user = make_user()
        self.other = make_user(email='other@notif.com')
        self.client.force_authenticate(user=self.user)

    def test_list_empty_for_new_user(self):
        resp = self.client.get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 0)

    def test_list_only_own_notifications(self):
        make_notification(self.other, title='Other notification')
        resp = self.client.get(self.URL)
        self.assertEqual(len(resp.data), 0)

    def test_list_shows_own_notifications(self):
        make_notification(self.user, title='My notification')
        resp = self.client.get(self.URL)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]['title'], 'My notification')

    def test_unauthenticated_returns_401(self):
        self.client.force_authenticate(user=None)
        resp = self.client.get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


# --------------- Notification CRUD ---------------

class NotificationCRUDTests(APITestCase):
    def setUp(self):
        self.user = make_user(email='crud@notif.com')
        self.client.force_authenticate(user=self.user)

    def test_create_notification_via_api(self):
        resp = self.client.post('/api/notifications/create/', {
            'title': 'New Notification',
            'message': 'You have a new message',
            'notification_type': 'info',
        }, format='json')
        self.assertIn(resp.status_code, [status.HTTP_201_CREATED, status.HTTP_200_OK])
        self.assertTrue(Notification.objects.filter(user=self.user, title='New Notification').exists())

    def test_mark_as_read(self):
        notif = make_notification(self.user, title='Unread')
        self.assertFalse(notif.is_read)
        resp = self.client.post(f'/api/notifications/{notif.id}/mark-read/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        notif.refresh_from_db()
        self.assertTrue(notif.is_read)

    def test_mark_all_as_read(self):
        make_notification(self.user, title='Notif 1')
        make_notification(self.user, title='Notif 2')
        resp = self.client.post('/api/notifications/mark-all-read/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        unread_count = Notification.objects.filter(user=self.user, is_read=False).count()
        self.assertEqual(unread_count, 0)

    def test_unread_count_updates(self):
        make_notification(self.user, title='Unread 1')
        make_notification(self.user, title='Unread 2')
        resp = self.client.get('/api/notifications/unread-count/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['unread_count'], 2)


# --------------- Notification Templates ---------------

class NotificationTemplateTests(APITestCase):
    def setUp(self):
        self.user = make_user(email='tmpl@notif.com')
        self.client.force_authenticate(user=self.user)

    def test_list_templates_authenticated(self):
        NotificationTemplate.objects.create(
            name='welcome',
            title_template='Добро пожаловать!',
            message_template='Вы успешно зарегистрированы.',
            notification_type='success',
            is_active=True,
        )
        resp = self.client.get('/api/notifications/templates/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data), 1)

    def test_list_templates_unauthenticated(self):
        self.client.force_authenticate(user=None)
        resp = self.client.get('/api/notifications/templates/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
