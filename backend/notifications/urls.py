from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('templates/', views.NotificationTemplateListView.as_view(), name='notification-template-list'),
    path('unread-count/', views.unread_notifications_count, name='unread-notifications-count'),
    path('mark-all-read/', views.mark_all_as_read, name='mark-all-read'),
    path('<int:notification_id>/mark-read/', views.mark_as_read, name='mark-as-read'),
    path('create/', views.create_notification, name='create-notification'),
]
