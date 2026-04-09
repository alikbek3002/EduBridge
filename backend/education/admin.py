from django.contrib import admin
from .models import (
    University, Major, UniversityMajor, Course, Enrollment, Application,
    Achievement, UserAchievement, AIRecommendation, StudyPlan, StudyPlanItem, Document
)


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'city', 'is_active')
    list_filter = ('country', 'is_active', 'created_at')
    search_fields = ('name', 'country', 'city')
    ordering = ('name',)


@admin.register(Major)
class MajorAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'description')


@admin.register(UniversityMajor)
class UniversityMajorAdmin(admin.ModelAdmin):
    list_display = ('university', 'major', 'duration_years', 'language', 'is_active')
    list_filter = ('university', 'major', 'language', 'is_active')


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'university', 'major', 'difficulty_level', 'price', 'is_active')
    list_filter = ('university', 'major', 'difficulty_level', 'is_free', 'is_active')
    search_fields = ('title', 'description')


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'enrolled_at', 'is_completed', 'progress_percentage')
    list_filter = ('is_completed', 'enrolled_at')
    search_fields = ('user__email', 'course__title')


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'university', 'major', 'status', 'submitted_at')
    list_filter = ('status', 'university', 'major', 'submitted_at')
    search_fields = ('user__email', 'university__name', 'major__name')


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'points', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'description')


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'achievement', 'earned_at')
    list_filter = ('earned_at',)
    search_fields = ('user__email', 'achievement__name')


@admin.register(AIRecommendation)
class AIRecommendationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'category', 'priority', 'is_read', 'created_at')
    list_filter = ('category', 'priority', 'is_read', 'created_at')
    search_fields = ('user__email', 'title', 'content')


@admin.register(StudyPlan)
class StudyPlanAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'target_university', 'start_date', 'end_date', 'is_active')
    list_filter = ('is_active', 'start_date', 'end_date')
    search_fields = ('user__email', 'title')


@admin.register(StudyPlanItem)
class StudyPlanItemAdmin(admin.ModelAdmin):
    list_display = ('study_plan', 'title', 'due_date', 'is_completed', 'order')
    list_filter = ('is_completed', 'due_date')
    search_fields = ('study_plan__title', 'title')


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'document_type', 'is_verified', 'uploaded_at')
    list_filter = ('document_type', 'is_verified', 'uploaded_at')
    search_fields = ('user__email', 'name')
