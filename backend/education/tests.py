from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from unittest.mock import patch
from datetime import timedelta

from accounts.models import UserProfile, UserDevice
from .models import (
    University, Achievement, UserAchievement, Application,
    StudyPlan, StudyPlanItem, Enrollment, Course, UserEvent,
    Document, StudentProgress,
)

User = get_user_model()


def make_user(email='edu@test.com', password='TestPass123!'):
    user = User.objects.create_user(
        username=email.split('@')[0],
        email=email,
        password=password,
        first_name='Edu',
        last_name='Test',
    )
    UserProfile.objects.get_or_create(user=user)
    return user


def make_university(name='Test University'):
    return University.objects.create(
        name=name, country='Italy', city='Rome',
        description='Test university', is_active=True,
    )


# --------------- Dashboard Stats ---------------

class DashboardStatsTests(APITestCase):
    URL = '/api/education/dashboard/stats/'

    def setUp(self):
        self.user = make_user()
        self.client.force_authenticate(user=self.user)

    def test_unauthenticated_returns_401(self):
        self.client.force_authenticate(user=None)
        resp = self.client.get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_stats_returns_correct_shape(self):
        resp = self.client.get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for key in ('overall_progress', 'current_streak', 'total_study_time', 'weekly_progress'):
            self.assertIn(key, resp.data)

    def test_streak_zero_for_new_user(self):
        resp = self.client.get(self.URL)
        self.assertEqual(resp.data['current_streak'], 0)

    def test_streak_counts_consecutive_device_logins(self):
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        UserDevice.objects.create(
            user=self.user, user_agent='test', ip_address='127.0.0.1', refresh_jti='jti1',
        )
        # Manually backdate one device to yesterday
        device2 = UserDevice.objects.create(
            user=self.user, user_agent='test', ip_address='127.0.0.1', refresh_jti='jti2',
        )
        UserDevice.objects.filter(pk=device2.pk).update(created_at=timezone.now() - timedelta(days=1))
        resp = self.client.get(self.URL)
        self.assertGreaterEqual(resp.data['current_streak'], 1)

    def test_weekly_progress_counts_completed_items(self):
        plan = StudyPlan.objects.create(
            user=self.user, title='Test Plan', is_active=True,
        )
        item = StudyPlanItem.objects.create(
            study_plan=plan, title='Task 1', is_completed=True, order=1,
        )
        StudyPlanItem.objects.filter(pk=item.pk).update(completed_at=timezone.now())
        resp = self.client.get(self.URL)
        self.assertGreaterEqual(resp.data['weekly_progress'], 1)

    def test_total_study_time_from_enrollments(self):
        course = Course.objects.create(
            title='Test Course', description='Desc', is_active=True, is_free=True,
        )
        Enrollment.objects.create(user=self.user, course=course, progress_percentage=50)
        resp = self.client.get(self.URL)
        self.assertEqual(resp.data['total_study_time'], 150)  # 50/100 * 300


# --------------- Applications ---------------

class ApplicationTests(APITestCase):
    URL = '/api/education/applications/'

    def setUp(self):
        self.user = make_user(email='appuser@test.com')
        self.other = make_user(email='other@test.com')
        self.university = make_university()
        self.client.force_authenticate(user=self.user)

    def test_list_applications_empty(self):
        resp = self.client.get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 0)

    def test_create_application(self):
        resp = self.client.post(self.URL, {
            'university': self.university.id,
            'motivation_letter': 'I want to study here',
        }, format='json')
        self.assertIn(resp.status_code, [status.HTTP_201_CREATED, status.HTTP_200_OK])

    def test_user_isolation(self):
        Application.objects.create(user=self.other, university=self.university)
        resp = self.client.get(self.URL)
        self.assertEqual(len(resp.data), 0)


# --------------- Achievements ---------------

class AchievementTests(APITestCase):
    def setUp(self):
        self.user = make_user(email='ach@test.com')
        self.client.force_authenticate(user=self.user)

    def test_list_achievements(self):
        Achievement.objects.create(name='First Step', description='Start', points=10, category='progress')
        resp = self.client.get('/api/education/achievements/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data), 1)

    def test_user_achievements_empty_on_creation(self):
        resp = self.client.get('/api/education/user-achievements/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 0)


# --------------- Documents ---------------

class DocumentTests(APITestCase):
    URL = '/api/education/documents/'

    def setUp(self):
        self.user = make_user(email='doc@test.com')
        self.client.force_authenticate(user=self.user)

    def test_list_documents_empty(self):
        resp = self.client.get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 0)

    @patch('education.utils_storage.upload_document_to_supabase', return_value=('test/path.pdf', 1024))
    def test_upload_document_local(self, mock_upload):
        import io
        fake_file = io.BytesIO(b'PDF content')
        fake_file.name = 'test.pdf'
        resp = self.client.post('/api/education/documents/upload/', {
            'file': fake_file,
            'document_type': 'diploma',
            'description': 'Test diploma',
        }, format='multipart')
        self.assertIn(resp.status_code, [status.HTTP_201_CREATED, status.HTTP_200_OK])


# --------------- User Events ---------------

class UserEventTests(APITestCase):
    URL = '/api/education/events/'

    def setUp(self):
        self.user = make_user(email='event@test.com')
        self.other = make_user(email='event2@test.com')
        self.client.force_authenticate(user=self.user)

    def test_create_event(self):
        resp = self.client.post(self.URL, {
            'title': 'IELTS Exam',
            'date': '2026-06-15',
        }, format='json')
        self.assertIn(resp.status_code, [status.HTTP_201_CREATED, status.HTTP_200_OK])
        self.assertTrue(UserEvent.objects.filter(user=self.user, title='IELTS Exam').exists())

    def test_list_events_filtered_by_user(self):
        UserEvent.objects.create(user=self.other, title='Other event', date='2026-06-20')
        resp = self.client.get(self.URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for event in resp.data:
            self.assertNotEqual(event.get('title'), 'Other event')

    def test_delete_event(self):
        event = UserEvent.objects.create(user=self.user, title='To Delete', date='2026-07-01')
        resp = self.client.delete(f'{self.URL}{event.id}/')
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(UserEvent.objects.filter(pk=event.pk).exists())
