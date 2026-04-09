from unittest.mock import patch
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from education.models import KnowledgeSource, KnowledgeChunk
from education.rag import build_rag_prompt

User = get_user_model()


class RAGPromptTest(TestCase):
    """Test the RAG prompt builder."""

    def test_build_rag_prompt_empty(self):
        """Should fall back to SYSTEM_BASE if no chunks."""
        prompt = build_rag_prompt([])
        from education.prompts import SYSTEM_BASE
        self.assertEqual(prompt, SYSTEM_BASE)

    def test_build_rag_prompt_with_chunks(self):
        """Should inject chunk content and include SYSTEM_RAG context."""
        source = KnowledgeSource.objects.create(
            title="Visa Guide Italy",
            url="https://example.com/visa",
        )
        chunk1 = KnowledgeChunk(
            source=source,
            chunk_index=0,
            content="You need a DOV (Dichiarazione di Valore) for visa.",
        )
        chunk2 = KnowledgeChunk(
            source=source,
            chunk_index=1,
            content="Pre-enrollment on Universitaly is mandatory.",
        )

        prompt = build_rag_prompt([chunk1, chunk2])
        self.assertIn("Visa Guide Italy", prompt)
        self.assertIn("Dichiarazione di Valore", prompt)
        self.assertIn("Universitaly", prompt)


@override_settings(SECURE_SSL_REDIRECT=False)
class RAGChatIntegrationTest(TestCase):
    """Test ai_views chat RAG integration (mocked to avoid OpenAI and pgvector overhead)."""

    def setUp(self):
        self.client = APIClient(secure=True)
        self.user = User.objects.create_user(
            username='raguser', email='rag@test.com',
            password='TestP@ss123!', first_name='RAG', last_name='User',
        )
        self.client.force_authenticate(user=self.user)

    @patch('education.ai_views.retrieve_chunks')
    @patch('education.ai_views.OpenAI')
    @patch('education.ai_views.os.getenv')
    def test_chat_uses_rag_by_default(self, mock_getenv, mock_openai, mock_retrieve):
        # Provide fake API key so it doesn't fall into demo mode
        mock_getenv.return_value = "fake-key"
        
        # Mock retrieve_chunks
        source = KnowledgeSource.objects.create(title="Fake Guide")
        fake_chunk = KnowledgeChunk(source=source, chunk_index=0, content="Fake DOV rule")
        mock_retrieve.return_value = [fake_chunk]
        
        # Mock OpenAI chat completion responses
        mock_client = mock_openai.return_value
        mock_client.chat.completions.create.return_value.choices = [
            type('obj', (object,), {'message': type('obj', (object,), {'content': 'Here is your info.'})})()
        ]
        mock_client.chat.completions.create.return_value.usage = None

        resp = self.client.post('/api/education/ai/chat/', {
            'messages': [{'role': 'user', 'content': 'What is DOV?'}],
            'use_rag': True
        }, format='json')

        self.assertEqual(resp.status_code, 200)
        
        # Ensure retrieve_chunks was called with our query
        mock_retrieve.assert_called_once_with('What is DOV?', top_k=3)
        
        # Check what was passed to OpenAI (the system prompt with fake chunk should be first)
        call_args = mock_client.chat.completions.create.call_args[1]
        messages_sent = call_args['messages']
        
        self.assertEqual(messages_sent[0]['role'], 'system')
        self.assertIn('Fake DOV rule', messages_sent[0]['content'])
        self.assertIn('Fake Guide', messages_sent[0]['content'])
        self.assertEqual(messages_sent[1]['content'], 'What is DOV?')
