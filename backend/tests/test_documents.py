"""Tests for Document upload and signed URL endpoints (P1.2)."""
import os
from unittest.mock import patch, MagicMock
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status

from education.models import Case, Document

User = get_user_model()


@override_settings(SECURE_SSL_REDIRECT=False)
class DocumentStorageTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='student1',
            email='student@example.com',
            password='Password123!',
            first_name='Student',
            last_name='Test'
        )
        self.other_user = User.objects.create_user(
            username='student2',
            email='other@example.com',
            password='Password123!',
            first_name='Other',
            last_name='Test'
        )
        
        self.client = APIClient(secure=True)
        # Authentication is required for document uploads
        self.client.force_authenticate(user=self.user)

    @patch('education.views.upload_document_to_supabase')
    def test_upload_document_success(self, mock_upload):
        """Test successful document upload to Supabase."""
        # Mock the Supabase upload to return a fake path and size
        mock_upload.return_value = ('documents/user_id/ielts/fake_uuid.pdf', 1024)
        
        file_content = b'fake pdf content'
        document = SimpleUploadedFile(
            'test_doc.pdf',
            file_content,
            content_type='application/pdf'
        )
        
        data = {
            'name': 'My IELTS Certificate',
            'document_type': 'language_certificate',
            'file': document
        }
        
        response = self.client.post('/api/education/documents/upload/', data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'My IELTS Certificate')
        self.assertEqual(response.data['storage_provider'], 'supabase')
        self.assertEqual(response.data['size_bytes'], 1024)
        self.assertTrue(Document.objects.filter(name='My IELTS Certificate').exists())

    def test_upload_document_missing_fields(self):
        """Test missing fields during document upload."""
        response = self.client.post('/api/education/documents/upload/', {}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_document_list_does_not_embed_signed_url(self):
        """List/detail contract should not mint signed URLs implicitly."""
        Document.objects.create(
            user=self.user,
            name='Stored In Supabase',
            document_type='language_certificate',
            storage_provider='supabase',
            storage_path='documents/test/list.pdf',
            size_bytes=1024,
        )

        response = self.client.get('/api/education/documents/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.data.get('results', response.data)
        self.assertEqual(len(payload), 1)
        self.assertEqual(payload[0]['file_url'], '')

    @patch('education.views.upload_document_to_supabase')
    def test_upload_document_rejects_foreign_case(self, mock_upload):
        """User must not attach a document to another student's case."""
        foreign_case = Case.objects.create(student=self.other_user, stage='intake')
        document = SimpleUploadedFile(
            'forbidden.pdf',
            b'forbidden pdf content',
            content_type='application/pdf'
        )

        response = self.client.post(
            '/api/education/documents/upload/',
            {
                'name': 'Forbidden Document',
                'document_type': 'language_certificate',
                'case': str(foreign_case.id),
                'file': document,
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(Document.objects.filter(name='Forbidden Document').exists())
        mock_upload.assert_not_called()

    @patch('education.views.get_signed_url')
    def test_get_signed_url_success(self, mock_get_url):
        """Test generating signed URL for a document."""
        mock_get_url.return_value = 'https://fake-supabase.com/signed-url?token=123'
        
        doc = Document.objects.create(
            user=self.user,
            name='Test Signed URL',
            document_type='language_certificate',
            storage_provider='supabase',
            storage_path='documents/test/path.pdf',
            size_bytes=1024
        )
        
        response = self.client.get(f'/api/education/documents/{doc.id}/signed-url/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['signed_url'], 'https://fake-supabase.com/signed-url?token=123')

    def test_get_signed_url_unauthorized(self):
        """Test that a user cannot access another user's document URL."""
        doc = Document.objects.create(
            user=self.user,
            name='Private Document',
            document_type='language_certificate',
            storage_provider='supabase',
            storage_path='documents/test/private.pdf',
        )
        
        # Authenticate as a different user
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(f'/api/education/documents/{doc.id}/signed-url/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
