from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import ai_views

# Router for viewsets
router = DefaultRouter()
router.register(r'cases', views.CaseViewSet, basename='case')
router.register(r'appointments', views.AppointmentViewSet, basename='appointment')

urlpatterns = [
    # Universities
    path('universities/', views.UniversityListView.as_view(), name='university-list'),
    path('universities/<int:pk>/', views.UniversityDetailView.as_view(), name='university-detail'),
    
    # Majors
    path('majors/', views.MajorListView.as_view(), name='major-list'),
    
    # Courses
    path('courses/', views.CourseListView.as_view(), name='course-list'),
    path('courses/<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    
    # Enrollments
    path('enrollments/', views.EnrollmentListView.as_view(), name='enrollment-list'),
    path('enrollments/<int:pk>/', views.EnrollmentDetailView.as_view(), name='enrollment-detail'),
    
    # Applications
    path('applications/', views.ApplicationListView.as_view(), name='application-list'),
    path('applications/<int:pk>/', views.ApplicationDetailView.as_view(), name='application-detail'),
    
    # Achievements
    path('achievements/', views.AchievementListView.as_view(), name='achievement-list'),
    path('user-achievements/', views.UserAchievementListView.as_view(), name='user-achievement-list'),
    
    # AI Recommendations
    path('ai-recommendations/', views.AIRecommendationListView.as_view(), name='ai-recommendation-list'),
    path('ai-recommendations/<int:pk>/', views.AIRecommendationDetailView.as_view(), name='ai-recommendation-detail'),
    path('generate-ai-recommendations/', views.generate_ai_recommendations, name='generate-ai-recommendations'),
    
    # Study Plans
    path('study-plans/', views.StudyPlanListView.as_view(), name='study-plan-list'),
    path('study-plans/<int:pk>/', views.StudyPlanDetailView.as_view(), name='study-plan-detail'),
    
    # Documents
    path('documents/', views.DocumentListView.as_view(), name='document-list'),
    path('documents/<int:pk>/', views.DocumentDetailView.as_view(), name='document-detail'),
    path('documents/upload/', views.UploadDocumentView.as_view(), name='document-upload'),
    path('documents/<int:pk>/signed-url/', views.DocumentSignedUrlView.as_view(), name='document-signed-url'),
    
    # Dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    path('dashboard/deadlines/', views.dashboard_deadlines, name='dashboard-deadlines'),
    # User Events
    path('events/', views.UserEventListCreateView.as_view(), name='user-event-list-create'),
    path('events/<int:pk>/', views.UserEventDetailView.as_view(), name='user-event-detail'),
    path('ai/chat/', ai_views.chat, name='ai-chat'),

    # Router-based (Cases, Appointments)
    path('', include(router.urls)),
]

