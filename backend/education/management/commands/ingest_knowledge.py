import os
from django.core.management.base import BaseCommand
from education.models import KnowledgeSource, KnowledgeChunk
from education.rag import get_embedding

class Command(BaseCommand):
    help = 'Ingests a text file into the Knowledge Base (runs embedding and creates chunks).'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to the text file')
        parser.add_argument('--title', type=str, help='Title of the document', required=True)
        parser.add_argument('--url', type=str, help='Source URL', default='')
        parser.add_argument('--country', type=str, help='Country Tag (e.g., Italy)', default='')
        parser.add_argument('--chunk-size', type=int, default=1000, help='Characters per chunk')
        parser.add_argument('--overlap', type=int, default=100, help='Overlap characters between chunks')

    def handle(self, *args, **options):
        file_path = options['file_path']
        title = options['title']
        url = options['url']
        country = options['country']
        chunk_size = options['chunk_size']
        overlap = options['overlap']

        if not os.path.exists(file_path):
            self.stderr.write(self.style.ERROR(f"File {file_path} does not exist."))
            return

        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()

        import hashlib
        content_hash = hashlib.sha256(text.encode('utf-8')).hexdigest()

        # Check if already ingested with same hash
        source, created = KnowledgeSource.objects.get_or_create(
            url=url if url else f"file://{os.path.basename(file_path)}",
            defaults={'title': title, 'country_tag': country, 'content_hash': content_hash}
        )

        if not created and source.content_hash == content_hash:
            self.stdout.write(self.style.SUCCESS(f"Source '{title}' already up to date. Skipping."))
            return

        # Update if it existed
        source.title = title
        source.country_tag = country
        source.content_hash = content_hash
        source.save()

        # Clear existing chunks
        KnowledgeChunk.objects.filter(source=source).delete()

        # Simple text chunking
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk_text = text[start:end]
            chunks.append(chunk_text)
            start += (chunk_size - overlap)

        self.stdout.write(f"Created {len(chunks)} chunks. Generating embeddings...")

        for i, chunk_text in enumerate(chunks):
            embedding = get_embedding(chunk_text)
            if embedding:
                KnowledgeChunk.objects.create(
                    source=source,
                    chunk_index=i,
                    content=chunk_text,
                    embedding=embedding
                )
                self.stdout.write(f"Chunk {i+1}/{len(chunks)} embedded.")
            else:
                self.stderr.write(self.style.WARNING(f"Failed to generate embedding for chunk {i+1}"))

        self.stdout.write(self.style.SUCCESS(f"Successfully ingested '{title}'."))
