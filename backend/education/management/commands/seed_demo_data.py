import hashlib
import os
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import (
    ConsultantProfile,
    Consent,
    EmailVerification,
    PasswordResetToken,
    UserDevice,
    UserProfile,
)
from education.models import (
    AIRecommendation,
    AIUsage,
    Achievement,
    Application,
    Appointment,
    Case,
    Course,
    Document,
    Enrollment,
    KnowledgeChunk,
    KnowledgeSource,
    Major,
    StudentProgress,
    StudyPlan,
    StudyPlanItem,
    University,
    UserAchievement,
    UserEvent,
)
from education.utils_storage import get_supabase_client
from notifications.models import Notification, NotificationTemplate
from payments.models import Invoice, Payment, SubscriptionPlan, UserSubscription


DOCUMENT_BUCKET_NAME = os.getenv("SUPABASE_DOCUMENT_BUCKET", "secure-documents")


class Command(BaseCommand):
    help = "Seed demo data for the main project entities."

    def handle(self, *args, **options):
        User = get_user_model()
        now = timezone.now()

        self.stdout.write("Seeding universities and majors...")
        call_command("seed_universities", verbosity=0)

        admin = self.ensure_user(
            User,
            email="admin@example.com",
            password="admin123",
            username="admin",
            first_name="Admin",
            last_name="User",
            is_staff=True,
            is_superuser=True,
            is_verified=True,
            phone="+996 555123456",
            country="Kyrgyzstan",
            city="Bishkek",
        )
        consultant_user = self.ensure_user(
            User,
            email="consultant@example.com",
            password="consult123",
            username="consultant",
            first_name="Aida",
            last_name="Consultant",
            is_staff=True,
            is_superuser=False,
            is_verified=True,
            phone="+996 700123456",
            country="Kyrgyzstan",
            city="Bishkek",
        )
        student = self.ensure_user(
            User,
            email="test@example.com",
            password="test123",
            username="test",
            first_name="Demo",
            last_name="Student",
            is_staff=False,
            is_superuser=False,
            is_verified=True,
            phone="+996 777123456",
            country="Kyrgyzstan",
            city="Bishkek",
        )
        student_two = self.ensure_user(
            User,
            email="student2@example.com",
            password="student123",
            username="student2",
            first_name="Second",
            last_name="Student",
            is_staff=False,
            is_superuser=False,
            is_verified=False,
            phone="+7 7012345678",
            country="Kazakhstan",
            city="Almaty",
        )
        supabase = self.get_storage_client()
        if supabase is not None:
            self.ensure_storage_bucket(supabase)

        consultant_profile, _ = ConsultantProfile.objects.update_or_create(
            user=consultant_user,
            defaults={
                "bio": "Senior consultant for Italy admissions and scholarships.",
                "languages": ["Russian", "English", "Italian"],
                "specialties": ["Admissions", "Visa", "Document review"],
                "timezone": "Asia/Bishkek",
                "is_active": True,
            },
        )

        self.ensure_profile(
            admin,
            onboarding_completed=True,
            bio="Platform administrator.",
            interests=["Operations"],
            goals=["Monitor platform health"],
            language_levels={"Russian": "native", "English": "B2"},
            education_background="Admin operations",
            work_experience="Oversees the platform",
            preferred_countries=["Italy"],
        )
        self.ensure_profile(
            consultant_user,
            onboarding_completed=True,
            bio="Consultant helping students with admissions in Italy.",
            interests=["Admissions", "Scholarships"],
            goals=["Help students enroll"],
            language_levels={"Russian": "native", "English": "C1", "Italian": "B2"},
            education_background="Master in International Education",
            work_experience="7 years of admissions consulting",
            preferred_countries=["Italy"],
        )
        self.ensure_profile(
            student,
            onboarding_completed=True,
            bio="Aspiring engineering student preparing to study in Italy.",
            interests=["Computer Science"],
            goals=["Получить степень бакалавра", "Найти работу за рубежом"],
            language_levels={"Russian": "native", "English": "B2", "Italian": "A2"},
            education_background="11 класс, физико-математический лицей",
            work_experience="Volunteer STEM tutor",
            preferred_countries=["Italy"],
            budget_range="10000-15000 EUR",
            study_duration="3-4 years",
            ielts_exam_date=(now + timedelta(days=21)).date(),
            ielts_current_score=6.5,
            ielts_target_score=7.0,
            tolc_current_score=28.0,
            tolc_target_score=35.0,
            tolc_exam_date=(now + timedelta(days=45)).date(),
        )
        self.ensure_profile(
            student_two,
            onboarding_completed=False,
            bio="Prospective student still filling out the profile.",
            interests=["Engineering"],
            goals=["Изучить новый язык"],
            language_levels={"Russian": "native", "English": "B1"},
            education_background="College diploma in IT",
            work_experience="Junior technician",
            preferred_countries=["Italy"],
        )

        StudentProgress.objects.update_or_create(
            user=student,
            defaults={
                "ielts_completed": True,
                "dov_completed": True,
                "universities_selected": True,
                "universitaly_registration": False,
                "visa_obtained": False,
            },
        )
        StudentProgress.objects.update_or_create(
            user=student_two,
            defaults={
                "ielts_completed": False,
                "dov_completed": False,
                "universities_selected": False,
                "universitaly_registration": False,
                "visa_obtained": False,
            },
        )

        Consent.objects.get_or_create(
            user=student,
            consent_type="terms",
            version="seed-v1",
            defaults={"ip_address": "127.0.0.1", "user_agent": "seed-script"},
        )
        Consent.objects.get_or_create(
            user=student,
            consent_type="privacy",
            version="seed-v1",
            defaults={"ip_address": "127.0.0.1", "user_agent": "seed-script"},
        )
        EmailVerification.objects.update_or_create(
            token="seed-verify-test-example-com",
            defaults={
                "user": student,
                "expires_at": now + timedelta(days=7),
                "is_used": True,
            },
        )
        PasswordResetToken.objects.update_or_create(
            token="seed-reset-test-example-com",
            defaults={
                "user": student,
                "expires_at": now + timedelta(days=3),
                "is_used": False,
            },
        )
        UserDevice.objects.get_or_create(
            user=student,
            refresh_jti="seed-device-jti-demo",
            defaults={
                "user_agent": "Seeded Browser Session",
                "ip_address": "127.0.0.1",
            },
        )

        universities = list(University.objects.filter(is_active=True).order_by("name")[:4])
        majors = list(Major.objects.filter(is_active=True).order_by("name")[:4])
        if not universities or not majors:
            raise RuntimeError("Universities or majors are missing after seed_universities.")

        course_specs = [
            ("Introduction to Italian University Life", universities[0], majors[0], "beginner", True, Decimal("0.00")),
            ("STEM Application Workshop", universities[1], majors[0], "intermediate", False, Decimal("49.00")),
            ("Engineering Prep Bootcamp", universities[2], majors[1], "intermediate", False, Decimal("79.00")),
            ("Academic Writing for Admissions", universities[3], majors[2], "beginner", True, Decimal("0.00")),
        ]
        courses = []
        for title, university, major, difficulty, is_free, price in course_specs:
            course, _ = Course.objects.update_or_create(
                title=title,
                university=university,
                major=major,
                defaults={
                    "description": f"{title} for students targeting {university.name}.",
                    "instructor": "EduBridge Team",
                    "duration_weeks": 6 if is_free else 10,
                    "difficulty_level": difficulty,
                    "price": price,
                    "is_free": is_free,
                    "is_active": True,
                },
            )
            courses.append(course)

        Enrollment.objects.update_or_create(
            user=student,
            course=courses[0],
            defaults={
                "progress_percentage": 100,
                "is_completed": True,
                "completed_at": now - timedelta(days=10),
            },
        )
        Enrollment.objects.update_or_create(
            user=student,
            course=courses[1],
            defaults={
                "progress_percentage": 60,
                "is_completed": False,
            },
        )

        achievement_specs = [
            ("Первые шаги", "Заполнен профиль и выбран путь обучения", "rocket", 50, "onboarding"),
            ("IELTS Ready", "Добавлены данные IELTS и сертификат", "certificate", 100, "language"),
            ("Shortlist Master", "Выбраны университеты для подачи", "school", 150, "admissions"),
        ]
        achievements = []
        for name, description, icon, points, category in achievement_specs:
            achievement, _ = Achievement.objects.update_or_create(
                name=name,
                defaults={
                    "description": description,
                    "icon": icon,
                    "points": points,
                    "category": category,
                    "is_active": True,
                },
            )
            achievements.append(achievement)
        for achievement in achievements[:2]:
            UserAchievement.objects.get_or_create(user=student, achievement=achievement)

        AIRecommendation.objects.update_or_create(
            user=student,
            title="Подайте документы в 3 университета",
            defaults={
                "content": "Рекомендуем начать с Politecnico di Milano, University of Bologna и Sapienza University of Rome.",
                "category": "applications",
                "priority": 1,
                "is_read": False,
            },
        )
        AIRecommendation.objects.update_or_create(
            user=student,
            title="Усильте профиль итальянским языком",
            defaults={
                "content": "Добавьте минимум 2 часа в неделю на разговорную практику и словарь по академическим темам.",
                "category": "language",
                "priority": 2,
                "is_read": False,
            },
        )

        study_plan, _ = StudyPlan.objects.update_or_create(
            user=student,
            title="Поступление в Италию 2026",
            defaults={
                "description": "Основной учебный и документальный план до подачи.",
                "target_university": universities[0],
                "target_major": majors[0],
                "start_date": now.date(),
                "end_date": (now + timedelta(days=120)).date(),
                "is_active": True,
            },
        )
        for order, title, days in [
            (1, "Подготовить пакет документов", 7),
            (2, "Завершить IELTS preparation", 21),
            (3, "Подать заявки в университеты", 35),
        ]:
            StudyPlanItem.objects.update_or_create(
                study_plan=study_plan,
                title=title,
                defaults={
                    "description": f"Task: {title}",
                    "due_date": (now + timedelta(days=days)).date(),
                    "is_completed": order == 1,
                    "completed_at": now - timedelta(days=1) if order == 1 else None,
                    "order": order,
                },
            )

        for university in universities[:2]:
            linked_major = university.majors.select_related("major").first()
            major = linked_major.major if linked_major else majors[0]
            Application.objects.update_or_create(
                user=student,
                university=university,
                major=major,
                defaults={
                    "status": "submitted" if university == universities[0] else "draft",
                    "motivation_letter": f"I am motivated to study at {university.name} because of its strong programs and international environment.",
                    "documents": ["passport", "transcript", "language_certificate"],
                    "submitted_at": now - timedelta(days=2) if university == universities[0] else None,
                    "reviewed_at": None,
                },
            )

        passport_storage = None
        ielts_storage = None
        if supabase is not None:
            passport_storage = self.upload_seed_document(
                supabase=supabase,
                user=student,
                document_type="passport",
                filename="passport-seed.txt",
                content=self.build_seed_document_content(
                    "Passport Scan",
                    [
                        "Seeded demo document for local development.",
                        "Student: test@example.com",
                        "Document type: passport",
                        "Country: Kyrgyzstan",
                    ],
                ),
            )
            ielts_storage = self.upload_seed_document(
                supabase=supabase,
                user=student,
                document_type="language_certificate",
                filename="ielts-seed.txt",
                content=self.build_seed_document_content(
                    "IELTS Certificate",
                    [
                        "Seeded demo certificate for local development.",
                        "Student: test@example.com",
                        "Exam: IELTS Academic",
                        "Current score: 6.5",
                        "Target score: 7.0",
                    ],
                ),
            )

        Document.objects.update_or_create(
            user=student,
            name="Passport Scan",
            document_type="passport",
            defaults={
                "description": "Seeded demo passport document",
                "is_verified": True,
                "storage_provider": (passport_storage or {}).get("storage_provider", "django_file"),
                "storage_path": (passport_storage or {}).get("storage_path", "documents/passport-seed.txt"),
                "mime_type": (passport_storage or {}).get("mime_type", "text/plain"),
                "size_bytes": (passport_storage or {}).get("size_bytes", 0),
                "sha256": (passport_storage or {}).get("sha256", ""),
            },
        )
        Document.objects.update_or_create(
            user=student,
            name="IELTS Certificate",
            document_type="language_certificate",
            defaults={
                "description": "Seeded demo IELTS certificate metadata",
                "is_verified": False,
                "storage_provider": (ielts_storage or {}).get("storage_provider", "django_file"),
                "storage_path": (ielts_storage or {}).get("storage_path", "documents/ielts-seed.txt"),
                "mime_type": (ielts_storage or {}).get("mime_type", "text/plain"),
                "size_bytes": (ielts_storage or {}).get("size_bytes", 0),
                "sha256": (ielts_storage or {}).get("sha256", ""),
            },
        )

        UserEvent.objects.update_or_create(
            user=student,
            title="Консультация по поступлению",
            date=(now + timedelta(days=5)).date(),
        )

        case, _ = Case.objects.update_or_create(
            student=student,
            stage="shortlist",
            defaults={
                "consultant": consultant_profile,
                "target_countries": ["Italy"],
                "notes": "Student is targeting engineering programs in Milan and Bologna.",
            },
        )
        case.target_universities.set(universities[:2])
        Appointment.objects.update_or_create(
            case=case,
            student=student,
            consultant=consultant_profile,
            start_at=now + timedelta(days=3),
            defaults={
                "end_at": now + timedelta(days=3, hours=1),
                "timezone": "Asia/Bishkek",
                "status": "confirmed",
                "meeting_url": "https://meet.example.com/edubridge-demo",
                "agenda": "Review shortlist and application timeline.",
            },
        )

        AIUsage.objects.get_or_create(
            user=student,
            request_id="seed-ai-usage-1",
            defaults={
                "model": "gpt-4o-mini",
                "prompt_tokens": 520,
                "completion_tokens": 180,
                "total_tokens": 700,
                "latency_ms": 820,
            },
        )

        source, _ = KnowledgeSource.objects.update_or_create(
            url="https://example.edu/politecnico-di-milano",
            defaults={
                "title": "Politecnico di Milano admissions guide",
                "country_tag": "Italy",
                "content_hash": "seeded-knowledge-source-hash",
            },
        )
        KnowledgeChunk.objects.update_or_create(
            source=source,
            chunk_index=0,
            defaults={
                "content": "Politecnico di Milano offers strong engineering and design programs with international admissions routes.",
                "embedding": None,
            },
        )

        for name, title, message, notif_type in [
            ("welcome", "Добро пожаловать", "Рады видеть вас в EduBridge.", "success"),
            ("deadline", "Дедлайн приближается", "Не забудьте завершить заявку до конца месяца.", "warning"),
            ("payment", "Оплата подтверждена", "Подписка активирована.", "payment"),
        ]:
            NotificationTemplate.objects.update_or_create(
                name=name,
                defaults={
                    "title_template": title,
                    "message_template": message,
                    "notification_type": notif_type,
                    "is_active": True,
                },
            )

        Notification.objects.get_or_create(
            user=student,
            title="Профиль заполнен",
            message="Анкета успешно заполнена. Можно переходить к дашборду.",
            defaults={
                "notification_type": "success",
                "is_read": False,
                "data": {"source": "seed_demo_data"},
            },
        )
        Notification.objects.get_or_create(
            user=student,
            title="Следующий шаг: shortlist",
            message="Выберите университеты и приоритетные программы для подачи.",
            defaults={
                "notification_type": "application",
                "is_read": False,
                "data": {"universities": [u.name for u in universities[:2]]},
            },
        )

        plan_specs = [
            (1, "Basic", "Entry plan for trying the platform", Decimal("10.00"), 30, ["Dashboard access", "Email support"]),
            (2, "Popular", "Most chosen plan for active applicants", Decimal("15.00"), 90, ["Full dashboard", "Priority support", "Recommendations"]),
            (3, "Best Value", "Long-term support for the whole admission cycle", Decimal("40.00"), 365, ["Premium access", "Consultation support", "Application tracking"]),
        ]
        plans = []
        for plan_id, name, description, price, duration_days, features in plan_specs:
            plan, _ = SubscriptionPlan.objects.update_or_create(
                id=plan_id,
                defaults={
                    "name": name,
                    "description": description,
                    "price": price,
                    "currency": "EUR",
                    "duration_days": duration_days,
                    "features": features,
                    "is_active": True,
                },
            )
            plans.append(plan)

        popular_plan = next((plan for plan in plans if plan.id == 2), plans[0])
        subscription, _ = UserSubscription.objects.update_or_create(
            user=student,
            plan=popular_plan,
            defaults={
                "end_date": now + timedelta(days=popular_plan.duration_days),
                "is_active": True,
                "auto_renew": True,
            },
        )
        payment, _ = Payment.objects.update_or_create(
            transaction_id="seed-payment-test-example-com-popular",
            defaults={
                "user": student,
                "subscription": subscription,
                "amount": popular_plan.price,
                "currency": popular_plan.currency,
                "status": "completed",
                "payment_method": "card",
                "description": "Seeded subscription payment",
                "completed_at": now - timedelta(days=1),
            },
        )
        Invoice.objects.update_or_create(
            invoice_number="SEED-INV-TEST-POPULAR",
            defaults={
                "user": student,
                "payment": payment,
                "due_date": now + timedelta(days=30),
                "is_paid": True,
            },
        )

        summary = {
            "users": User.objects.count(),
            "profiles": UserProfile.objects.count(),
            "consultants": ConsultantProfile.objects.count(),
            "universities": University.objects.count(),
            "majors": Major.objects.count(),
            "courses": Course.objects.count(),
            "applications": Application.objects.count(),
            "plans": SubscriptionPlan.objects.count(),
            "notifications": Notification.objects.count(),
        }

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully."))
        for key, value in summary.items():
            self.stdout.write(f" - {key}: {value}")

    def ensure_user(self, User, **kwargs):
        email = kwargs.pop("email")
        password = kwargs.pop("password")
        username = kwargs.pop("username")
        defaults = {
            "username": username,
            **kwargs,
        }
        user, _ = User.objects.update_or_create(email=email, defaults=defaults)
        user.set_password(password)
        user.save()
        return user

    def ensure_profile(self, user, **profile_defaults):
        profile, _ = UserProfile.objects.update_or_create(user=user, defaults=profile_defaults)
        return profile

    def get_storage_client(self):
        if not os.getenv("SUPABASE_URL", "").strip() or not os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip():
            return None
        try:
            return get_supabase_client()
        except Exception as exc:
            self.stdout.write(self.style.WARNING(f"Supabase storage disabled: {exc}"))
            return None

    def ensure_storage_bucket(self, supabase):
        existing_buckets = {bucket.name for bucket in supabase.storage.list_buckets()}
        if DOCUMENT_BUCKET_NAME in existing_buckets:
            self.stdout.write(f"Supabase bucket '{DOCUMENT_BUCKET_NAME}' already exists.")
            return

        supabase.storage.create_bucket(
            DOCUMENT_BUCKET_NAME,
            options={
                "public": False,
                "file_size_limit": 10 * 1024 * 1024,
                "allowed_mime_types": ["text/plain", "application/pdf"],
            },
        )
        self.stdout.write(self.style.SUCCESS(f"Created Supabase bucket '{DOCUMENT_BUCKET_NAME}'."))

    def build_seed_document_content(self, title, lines):
        payload = [title, "=" * len(title), *lines, ""]
        return "\n".join(payload).encode("utf-8")

    def upload_seed_document(self, *, supabase, user, document_type, filename, content):
        storage_path = f"documents/{user.id}/{document_type}/{filename}"

        try:
            supabase.storage.from_(DOCUMENT_BUCKET_NAME).upload(
                path=storage_path,
                file=content,
                file_options={
                    "content-type": "text/plain",
                    "cache-control": "3600",
                    "upsert": "true",
                },
            )
        except Exception as exc:
            self.stdout.write(
                self.style.WARNING(f"Failed to upload seeded '{document_type}' document to Supabase: {exc}")
            )
            return None

        return {
            "storage_provider": "supabase",
            "storage_path": storage_path,
            "mime_type": "text/plain",
            "size_bytes": len(content),
            "sha256": hashlib.sha256(content).hexdigest(),
        }
