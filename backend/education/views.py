import logging
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count, Sum, F
from django.utils import timezone
from datetime import timedelta
from django.db.models.functions import Coalesce

from .models import (
    University, Major, Course, Enrollment, Application, Achievement,
    UserAchievement, AIRecommendation, StudyPlan, StudyPlanItem, Document,
    StudentProgress, UserEvent
)
from .utils_storage import upload_document_to_supabase, get_signed_url
from .serializers import (
    UniversitySerializer, MajorSerializer, CourseSerializer, EnrollmentSerializer,
    ApplicationSerializer, ApplicationCreateSerializer, AchievementSerializer,
    UserAchievementSerializer, AIRecommendationSerializer, StudyPlanSerializer,
    StudyPlanItemSerializer, DocumentSerializer, DashboardStatsSerializer,
    UserEventSerializer
)


class UniversityListView(generics.ListAPIView):
    queryset = University.objects.filter(is_active=True).prefetch_related('majors__major')
    serializer_class = UniversitySerializer
    # Public for landing page consumption
    permission_classes = [permissions.AllowAny]
    # Убрали фильтрацию по стране; оставили только город
    filterset_fields = ['city']
    search_fields = ['name', 'description']
    ordering_fields = ['name']
    ordering = ['name']
    # Убираем пагинацию для получения всех университетов
    pagination_class = None

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Фильтрация по специальности
        major = self.request.query_params.get('major')
        if major:
            queryset = queryset.filter(majors__major__name__icontains=major)
        
        return queryset


class UniversityDetailView(generics.RetrieveAPIView):
    queryset = University.objects.filter(is_active=True)
    serializer_class = UniversitySerializer
    permission_classes = [permissions.AllowAny]


class MajorListView(generics.ListAPIView):
    queryset = Major.objects.filter(is_active=True)
    serializer_class = MajorSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['name', 'description']
    ordering_fields = ['name']
    ordering = ['name']


class CourseListView(generics.ListAPIView):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['university', 'major', 'difficulty_level', 'is_free']
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'price', 'created_at']
    ordering = ['-created_at']


class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]


class EnrollmentListView(generics.ListCreateAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class EnrollmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user)


class ApplicationListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ApplicationCreateSerializer
        return ApplicationSerializer

    def get_queryset(self):
        return Application.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(user=self.request.user)


class AchievementListView(generics.ListAPIView):
    queryset = Achievement.objects.filter(is_active=True)
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserAchievementListView(generics.ListAPIView):
    serializer_class = UserAchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserAchievement.objects.filter(user=self.request.user)


class AIRecommendationListView(generics.ListAPIView):
    serializer_class = AIRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AIRecommendation.objects.filter(user=self.request.user).order_by('-created_at')


class AIRecommendationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = AIRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AIRecommendation.objects.filter(user=self.request.user)


class StudyPlanListView(generics.ListCreateAPIView):
    serializer_class = StudyPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudyPlan.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class StudyPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StudyPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudyPlan.objects.filter(user=self.request.user)


class DocumentListView(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user).order_by('-uploaded_at', '-id')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    
    # Get or create student progress
    try:
        progress = StudentProgress.objects.get(user=user)
    except StudentProgress.DoesNotExist:
        progress = StudentProgress.objects.create(user=user)
    except Exception:
        logger.exception("Error getting student progress for user_id=%s", user.id)
        progress = None
    
    # Calculate overall progress
    overall_progress = progress.calculate_progress() if progress else 0
    
    # Course statistics
    total_courses = Course.objects.filter(is_active=True).count()
    completed_courses = Enrollment.objects.filter(
        user=user, is_completed=True
    ).count()
    
    # Upcoming deadlines (from study plans)
    upcoming_deadlines = StudyPlanItem.objects.filter(
        study_plan__user=user,
        is_completed=False,
        due_date__gte=timezone.now().date()
    ).count()
    
    # Achievements
    achievements_unlocked = UserAchievement.objects.filter(user=user).count()
    
    # Current streak
    current_streak = 7  # Mock value
    
    # Study time statistics (mock values for now)
    total_study_time = 45
    weekly_goal = 20
    weekly_progress = 12
    
    # Get recommended courses
    recommended_courses = Course.objects.filter(is_active=True)[:3]
    
    # Calculate total points with proper null handling
    total_points = UserAchievement.objects.filter(user=user).annotate(
        points=Coalesce(F('achievement__points'), 0)
    ).aggregate(total=Sum('points'))['total'] or 0
    
    # Get number of submitted applications
    applications_submitted = Application.objects.filter(user=user).count()
    
    stats = {
        'overall_progress': overall_progress,
        'ielts_completed': progress.ielts_completed,
        'dov_completed': progress.dov_completed,
        'universities_selected': progress.universities_selected,
        'universitaly_registration': progress.universitaly_registration,
        'visa_obtained': progress.visa_obtained,
        'total_courses': total_courses,
        'completed_courses': completed_courses,
        'upcoming_deadlines': upcoming_deadlines,
        'achievements_unlocked': achievements_unlocked,
        'current_streak': current_streak,
        'total_study_time': total_study_time,
        'weekly_goal': weekly_goal,
        'weekly_progress': weekly_progress,
        'recommended_courses': recommended_courses,
        'total_points': total_points,
        'applications_submitted': applications_submitted
    }
    
    serializer = DashboardStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_deadlines(request):
    """Return upcoming study plan item deadlines for the current user."""
    today = timezone.now().date()
    items = StudyPlanItem.objects.filter(
        study_plan__user=request.user,
        is_completed=False,
        due_date__gte=today,
    ).order_by('due_date')[:20]

    results = []
    for it in items:
        days_remaining = (it.due_date - today).days
        if days_remaining <= 7:
            priority, color = 'high', 'red'
        elif days_remaining <= 30:
            priority, color = 'medium', 'yellow'
        else:
            priority, color = 'low', 'green'

        results.append({
            'id': it.id,
            'title': it.title,
            'due_date': it.due_date.isoformat(),
            'days': days_remaining,
            'priority': priority,
            'color': color,
        })

    return Response(results)


class UserEventListCreateView(generics.ListCreateAPIView):
    serializer_class = UserEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserEvent.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserEventDetailView(generics.DestroyAPIView):
    serializer_class = UserEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserEvent.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_ai_recommendations(request):
    user = request.user
    
    # Генерируем рекомендации на основе профиля пользователя
    recommendations = [
        {
            'title': 'Рекомендуемые университеты',
            'content': 'На основе ваших интересов рекомендуем рассмотреть университеты в Италии.',
            'category': 'university',
            'priority': 1
        },
        {
            'title': 'Подготовка к IELTS',
            'content': 'Начните подготовку к IELTS за 6 месяцев до подачи заявки.',
            'category': 'preparation',
            'priority': 2
        },
        {
            'title': 'Сбор документов',
            'content': 'Подготовьте все необходимые документы заранее.',
            'category': 'documents',
            'priority': 3
        }
    ]
    
    for rec_data in recommendations:
        AIRecommendation.objects.create(
            user=user,
            title=rec_data['title'],
            content=rec_data['content'],
            category=rec_data['category'],
            priority=rec_data['priority']
        )
    
    return Response({'message': 'Рекомендации сгенерированы'})


# --------------- Consulting ViewSets (P1.1) ---------------

from rest_framework import viewsets
from .models import Case, Appointment
from .serializers import CaseSerializer, AppointmentSerializer
from .permissions import IsOwnerStudent, IsAssignedConsultant

logger = logging.getLogger(__name__)


class CaseViewSet(viewsets.ModelViewSet):
    """CRUD for consulting cases. Students see their own; consultants see assigned."""
    serializer_class = CaseSerializer

    def get_queryset(self):
        user = self.request.user
        # If user is a consultant, show cases assigned to them
        if hasattr(user, 'consultant_profile'):
            return Case.objects.filter(consultant=user.consultant_profile).order_by('-created_at')
        # Otherwise show cases where user is the student
        return Case.objects.filter(student=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class AppointmentViewSet(viewsets.ModelViewSet):
    """CRUD for appointments. Students/consultants see their own."""
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'consultant_profile'):
            return Appointment.objects.filter(consultant=user.consultant_profile)
        return Appointment.objects.filter(student=user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


# --------------- Document Storage (P1.2) ---------------

class UploadDocumentView(generics.CreateAPIView):
    """
    Upload a document directly to Supabase Storage and create a Document record.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DocumentSerializer

    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        name = request.data.get('name')
        document_type = request.data.get('document_type')
        case_id = request.data.get('case')  # ID from foreign key
        
        if not file_obj or not name or not document_type:
            return Response({'error': 'file, name, and document_type are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            linked_case = None
            if case_id:
                case_filter = Q(id=case_id, student=request.user)
                consultant_profile = getattr(request.user, 'consultant_profile', None)
                if consultant_profile is not None:
                    case_filter |= Q(id=case_id, consultant=consultant_profile)
                linked_case = Case.objects.filter(case_filter).first()
                if linked_case is None and not request.user.is_staff:
                    return Response({'error': 'Case not found.'}, status=status.HTTP_404_NOT_FOUND)

            storage_path, size_bytes = upload_document_to_supabase(
                file_obj=file_obj,
                user_id=str(request.user.id),
                document_type=document_type
            )
            
            doc_data = {
                'name': name,
                'document_type': document_type,
                'storage_provider': 'supabase',
                'storage_path': storage_path,
                'mime_type': getattr(file_obj, 'content_type', 'application/octet-stream'),
                'size_bytes': size_bytes,
                'user': request.user
            }
            if linked_case is not None:
                doc_data['case'] = linked_case
                
            doc = Document.objects.create(**doc_data)
            
            # Return serialized data
            serializer = self.get_serializer(doc)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.exception("Document upload failed for user_id=%s", request.user.id)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DocumentSignedUrlView(generics.GenericAPIView):
    """
    Get a temporary signed URL for a document if the user has access.
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = Document.objects.all()
    
    def get(self, request, pk, *args, **kwargs):
        document = self.get_object()
        
        # Check permissions: user is owner or assigned consultant (via case)
        # For simplicity: owner check
        if document.user != request.user:
            # Maybe check if case consultant matches
            if document.case and getattr(request.user, 'consultant_profile', None) == document.case.consultant:
                pass # Allow consultant
            elif request.user.is_staff:
                pass # Allow admin
            else:
                return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
                
        if document.storage_provider == 'supabase' and document.storage_path:
            url = get_signed_url(document.storage_path, expires_in=3600)
            if url:
                return Response({'signed_url': url})
            return Response({'error': 'Failed to generate URL'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        elif document.file:
            # Fallback for local files
            request_context = self.request
            url = request_context.build_absolute_uri(document.file.url)
            return Response({'signed_url': url})
            
        return Response({'error': 'Document file not found'}, status=status.HTTP_404_NOT_FOUND)


