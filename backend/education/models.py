from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

try:
    from pgvector.django import VectorField
except ImportError:
    # Fallback definition for local dev without pgvector installed yet
    class VectorField(models.Field):
        pass

User = get_user_model()


class University(models.Model):
    name = models.CharField(max_length=200)
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    description = models.TextField()
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='universities/', null=True, blank=True)
    level = models.CharField(max_length=50, blank=True)
    student_count = models.IntegerField(null=True, blank=True)
    # Application submission deadline (replaces founded_year)
    deadline = models.DateField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.country})"

    class Meta:
        verbose_name_plural = "Universities"


class StudentProgress(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='progress')
    ielts_completed = models.BooleanField(default=False)
    dov_completed = models.BooleanField(default=False)
    universities_selected = models.BooleanField(default=False)
    universitaly_registration = models.BooleanField(default=False)
    visa_obtained = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def calculate_progress(self):
        total_steps = 5  # Total number of steps
        completed_steps = sum([
            self.ielts_completed,
            self.dov_completed,
            self.universities_selected,
            self.universitaly_registration,
            self.visa_obtained
        ])
        return (completed_steps / total_steps) * 100

    def __str__(self):
        return f"Progress for {self.user.username}"


class Major(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class UniversityMajor(models.Model):
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='majors')
    major = models.ForeignKey(Major, on_delete=models.CASCADE)
    duration_years = models.IntegerField(default=3)
    language = models.CharField(max_length=50, default='English')
    requirements = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.university.name} - {self.major.name}"

    class Meta:
        unique_together = ['university', 'major']


class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='courses')
    major = models.ForeignKey(Major, on_delete=models.CASCADE, related_name='courses')
    instructor = models.CharField(max_length=200, blank=True)
    duration_weeks = models.IntegerField(default=12)
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
        ],
        default='beginner'
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_free = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.university.name}"


class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    progress_percentage = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.email} - {self.course.title}"

    class Meta:
        unique_together = ['user', 'course']


class Application(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('waitlisted', 'Waitlisted'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='applications')
    major = models.ForeignKey(Major, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    motivation_letter = models.TextField()
    documents = models.JSONField(default=list, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.university.name}"

    class Meta:
        unique_together = ['user', 'university', 'major']


class Achievement(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.CharField(max_length=100, blank=True)
    points = models.IntegerField(default=0)
    category = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.achievement.name}"

    class Meta:
        unique_together = ['user', 'achievement']


class AIRecommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_recommendations')
    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.CharField(max_length=100)
    priority = models.IntegerField(default=1)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.title}"


class StudyPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_plans')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    target_university = models.ForeignKey(University, on_delete=models.CASCADE, null=True, blank=True)
    target_major = models.ForeignKey(Major, on_delete=models.CASCADE, null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.title}"


class StudyPlanItem(models.Model):
    study_plan = models.ForeignKey(StudyPlan, on_delete=models.CASCADE, related_name='items')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateField()
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    order = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.study_plan.title} - {self.title}"

    class Meta:
        ordering = ['order', 'due_date']


class Document(models.Model):
    DOCUMENT_TYPES = [
        ('passport', 'Passport'),
        ('diploma', 'Diploma'),
        ('transcript', 'Transcript'),
        ('language_certificate', 'Language Certificate'),
        ('motivation_letter', 'Motivation Letter'),
        ('cv', 'CV'),
        ('recommendation_letter', 'Recommendation Letter'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    name = models.CharField(max_length=200)
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to='documents/', blank=True, null=True)
    description = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    # P1.2: Secure storage fields
    case = models.ForeignKey('education.Case', null=True, blank=True,
                             on_delete=models.SET_NULL, related_name='documents')
    storage_provider = models.CharField(max_length=16, default='django_file')  # django_file / supabase / s3
    storage_path = models.TextField(blank=True)
    mime_type = models.CharField(max_length=128, blank=True)
    size_bytes = models.BigIntegerField(default=0)
    sha256 = models.CharField(max_length=64, blank=True, db_index=True)

    def __str__(self):
        return f"{self.user.email} - {self.name}"


class UserEvent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=200)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'id']

    def __str__(self):
        return f"{self.user.email} - {self.title} ({self.date})"


# --------------- Consulting Entities (P1.1) ---------------

class Case(models.Model):
    STAGES = [
        ('intake', 'Intake'),
        ('shortlist', 'Shortlist'),
        ('documents', 'Documents'),
        ('submitted', 'Submitted'),
        ('visa', 'Visa'),
        ('done', 'Done'),
        ('paused', 'Paused'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cases')
    consultant = models.ForeignKey(
        'accounts.ConsultantProfile', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='cases',
    )
    stage = models.CharField(max_length=32, choices=STAGES, default='intake')
    target_countries = models.JSONField(default=list, blank=True)
    target_universities = models.ManyToManyField('education.University', blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['student', 'stage']),
            models.Index(fields=['consultant', 'stage']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Case {self.id} — {self.student.email} ({self.stage})"


class Appointment(models.Model):
    STATUS = [
        ('requested', 'Requested'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
        ('no_show', 'No show'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey('education.Case', on_delete=models.CASCADE, related_name='appointments')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    consultant = models.ForeignKey(
        'accounts.ConsultantProfile', on_delete=models.CASCADE, related_name='appointments',
    )
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    timezone = models.CharField(max_length=64, default='UTC')
    status = models.CharField(max_length=16, choices=STATUS, default='requested')
    meeting_url = models.URLField(blank=True)
    agenda = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['consultant', 'start_at']),
            models.Index(fields=['student', 'start_at']),
        ]

    def __str__(self):
        return f"Appointment {self.id} ({self.status})"


class AIUsage(models.Model):
    """Per-request AI token usage for cost tracking and daily limits."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_usage')
    created_at = models.DateTimeField(auto_now_add=True)
    model = models.CharField(max_length=64)
    prompt_tokens = models.IntegerField(default=0)
    completion_tokens = models.IntegerField(default=0)
    total_tokens = models.IntegerField(default=0)
    request_id = models.CharField(max_length=64, blank=True)
    latency_ms = models.IntegerField(default=0)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        return f"AIUsage({self.user_id}, {self.model}, {self.total_tokens} tokens)"


# --------------- RAG Entities (P1.3) ---------------

class KnowledgeSource(models.Model):
    """
    Metadata about a parsed source (e.g. university page, guide).
    """
    url = models.URLField(max_length=500, unique=True, null=True, blank=True)
    title = models.CharField(max_length=300)
    country_tag = models.CharField(max_length=50, blank=True)
    content_hash = models.CharField(max_length=64, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class KnowledgeChunk(models.Model):
    """
    A chunk of text from a KnowledgeSource, along with its embedding.
    """
    source = models.ForeignKey(KnowledgeSource, on_delete=models.CASCADE, related_name='chunks')
    chunk_index = models.IntegerField()
    content = models.TextField()
    # OpenAI text-embedding-ada-002 and text-embedding-3-small use 1536 dimensions
    embedding = VectorField(dimensions=1536, null=True, blank=True)

    def __str__(self):
        return f"Chunk {self.chunk_index} of {self.source.title}"
