from django.core.management.base import BaseCommand
from django.utils import timezone
from education.models import University, Major, UniversityMajor

SAMPLE_UNIVERSITIES = [
    {
        'name': 'Politecnico di Milano',
        'country': 'Italy',
        'city': 'Milano',
        'description': 'Top technical university in Italy with strong engineering and design programs.',
        'website': 'https://www.polimi.it',
        'level': 'Top-100',
        'student_count': 47000,
        'deadline': timezone.now().date().replace(month=11, day=15),
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/7/76/Politecnico_Milano_logo.png',
        'latitude': 45.4789,
        'longitude': 9.2274,
    },
    {
        'name': 'Sapienza University of Rome',
        'country': 'Italy',
        'city': 'Roma',
        'description': 'One of the oldest universities in the world with a wide range of programs.',
        'website': 'https://www.uniroma1.it',
        'level': 'Top-150',
        'student_count': 112000,
        'deadline': timezone.now().date().replace(month=12, day=1),
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Sapienza_Universit%C3%A0_di_Roma.svg',
        'latitude': 41.9028,
        'longitude': 12.4964,
    },
    {
        'name': 'University of Bologna',
        'country': 'Italy',
        'city': 'Bologna',
        'description': 'Founded in 1088, the oldest university in continuous operation.',
        'website': 'https://www.unibo.it',
        'level': 'Top-200',
        'student_count': 87000,
        'deadline': timezone.now().date().replace(month=10, day=31),
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Alma_Mater_Studiorum.svg',
        'latitude': 44.4949,
        'longitude': 11.3426,
    },
    {
        'name': 'University of Florence',
        'country': 'Italy',
        'city': 'Firenze',
        'description': 'Renowned for arts, humanities, and sciences programs.',
        'website': 'https://www.unifi.it',
        'level': 'Top-300',
        'student_count': 52000,
        'deadline': timezone.now().date().replace(month=9, day=30),
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/8/8a/University_of_Florence_logo.svg',
        'latitude': 43.7696,
        'longitude': 11.2558,
    },
    {
        'name': 'University of Naples Federico II',
        'country': 'Italy',
        'city': 'Napoli',
        'description': 'One of the oldest public universities in the world.',
        'website': 'https://www.unina.it',
        'level': 'Top-400',
        'student_count': 95000,
        'deadline': timezone.now().date().replace(month=11, day=30),
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/9/9a/University_of_Naples_Federico_II_logo.svg',
        'latitude': 40.8518,
        'longitude': 14.2681,
    },
    {
        'name': 'University of Padua',
        'country': 'Italy',
        'city': 'Padova',
        'description': 'Founded in 1222, known for medicine and law programs.',
        'website': 'https://www.unipd.it',
        'level': 'Top-250',
        'student_count': 65000,
        'deadline': timezone.now().date().replace(month=10, day=15),
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/1/1e/University_of_Padua_logo.svg',
        'latitude': 45.4077,
        'longitude': 11.8734,
    },
    {
        'name': 'University of Pisa',
        'country': 'Italy',
        'city': 'Pisa',
        'description': 'Famous for its leaning tower and strong science programs.',
        'website': 'https://www.unipi.it',
        'level': 'Top-350',
        'student_count': 50000,
        'deadline': timezone.now().date().replace(month=9, day=15),
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/7/7a/University_of_Pisa_logo.svg',
        'latitude': 43.7228,
        'longitude': 10.4017,
    },
    {
        'name': 'University of Turin',
        'country': 'Italy',
        'city': 'Torino',
        'description': 'Leading research university in northern Italy.',
        'website': 'https://www.unito.it',
        'level': 'Top-400',
        'student_count': 80000,
        'deadline': timezone.now().date().replace(month=11, day=1),
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/8/8b/University_of_Turin_logo.svg',
        'latitude': 45.0703,
        'longitude': 7.6869,
    },
    {
        'name': 'Ca\' Foscari University of Venice',
        'country': 'Italy',
        'city': 'Venezia',
        'description': 'Specialized in humanities, economics, and foreign languages.',
        'website': 'https://www.unive.it',
        'level': 'Top-500',
        'student_count': 20000,
        'deadline': timezone.now().date().replace(month=10, day=1),
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Ca_Foscari_University_logo.svg',
        'latitude': 45.4408,
        'longitude': 12.3155,
    },
    {
        'name': 'University of Milan',
        'country': 'Italy',
        'city': 'Milano',
        'description': 'Large public research university with diverse programs.',
        'website': 'https://www.unimi.it',
        'level': 'Top-300',
        'student_count': 60000,
        'deadline': timezone.now().date().replace(month=12, day=15),
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/6/6a/University_of_Milan_logo.svg',
        'latitude': 45.4789,
        'longitude': 9.2274,
    },
    {
        'name': 'Bocconi University',
        'country': 'Italy',
        'city': 'Milano',
        'description': 'Premier business and economics university in Italy.',
        'website': 'https://www.unibocconi.it',
        'level': 'Top-100',
        'student_count': 15000,
        'deadline': timezone.now().date().replace(month=1, day=15),
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Bocconi_University_logo.svg',
        'latitude': 45.4789,
        'longitude': 9.2274,
    },
    {
        'name': 'University of Genoa',
        'country': 'Italy',
        'city': 'Genova',
        'description': 'Historic university with strong maritime and engineering programs.',
        'website': 'https://www.unige.it',
        'level': 'Top-500',
        'student_count': 30000,
        'deadline': timezone.now().date().replace(month=9, day=30),
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/4/4a/University_of_Genoa_logo.svg',
        'latitude': 44.4056,
        'longitude': 8.9463,
    },
    {
        'name': 'University of Pavia',
        'country': 'Italy',
        'city': 'Pavia',
        'description': 'Ancient university known for medicine and humanities.',
        'website': 'https://www.unipv.it',
        'level': 'Top-400',
        'student_count': 25000,
        'deadline': timezone.now().date().replace(month=10, day=31),
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/University_of_Pavia_logo.svg',
        'latitude': 45.1847,
        'longitude': 9.1582,
    },
    {
        'name': 'University of Siena',
        'country': 'Italy',
        'city': 'Siena',
        'description': 'Historic university with strong programs in medicine and law.',
        'website': 'https://www.unisi.it',
        'level': 'Top-600',
        'student_count': 20000,
        'deadline': timezone.now().date().replace(month=9, day=15),
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/University_of_Siena_logo.svg',
        'latitude': 43.3188,
        'longitude': 11.3307,
    },
    {
        'name': 'University of Verona',
        'country': 'Italy',
        'city': 'Verona',
        'description': 'Modern university with innovative research programs.',
        'website': 'https://www.univr.it',
        'level': 'Top-700',
        'student_count': 25000,
        'deadline': timezone.now().date().replace(month=11, day=15),
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/8/8c/University_of_Verona_logo.svg',
        'latitude': 45.4384,
        'longitude': 10.9916,
    },
    {
        'name': 'University of Trento',
        'country': 'Italy',
        'city': 'Trento',
        'description': 'Young university with strong focus on technology and innovation.',
        'website': 'https://www.unitn.it',
        'level': 'Top-400',
        'student_count': 16000,
        'deadline': timezone.now().date().replace(month=12, day=1),
        'logo': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/University_of_Trento_logo.svg',
        'latitude': 46.0748,
        'longitude': 11.1217,
    },
]

SAMPLE_MAJORS = [
    ('Computer Science', 'IT and computing programs'),
    ('Engineering', 'Engineering disciplines'),
    ('Design', 'Industrial and product design'),
]

class Command(BaseCommand):
    help = 'Seed sample universities and majors for the landing slider.'

    def handle(self, *args, **options):
        created_universities = 0

        # Ensure base majors exist
        major_objs = {}
        for name, desc in SAMPLE_MAJORS:
            m, _ = Major.objects.get_or_create(name=name, defaults={'description': desc, 'is_active': True})
            major_objs[name] = m

        for uni_data in SAMPLE_UNIVERSITIES:
            uni, created = University.objects.get_or_create(
                name=uni_data['name'],
                defaults={
                    'country': uni_data['country'],
                    'city': uni_data['city'],
                    'description': uni_data['description'],
                    'website': uni_data['website'],
                    'level': uni_data['level'],
                    'student_count': uni_data['student_count'],
                    'deadline': uni_data['deadline'],
                    'latitude': uni_data.get('latitude'),
                    'longitude': uni_data.get('longitude'),
                    # For demo we store absolute URL in logo field; serializer returns it via logo_url
                    'is_active': True,
                }
            )
            
            # Обновляем координаты для существующих университетов
            if not created and ('latitude' in uni_data or 'longitude' in uni_data):
                update_fields = {}
                if 'latitude' in uni_data:
                    update_fields['latitude'] = uni_data['latitude']
                if 'longitude' in uni_data:
                    update_fields['longitude'] = uni_data['longitude']
                if update_fields:
                    University.objects.filter(pk=uni.pk).update(**update_fields)
                    uni.refresh_from_db()
            # If logo empty and we have a string URL, store it as text in the FileField name
            # Many storages allow setting name to a string; our serializer handles absolute URLs.
            if not uni.logo and isinstance(uni_data['logo'], str):
                # Save URL string into the underlying field without touching storage
                University.objects.filter(pk=uni.pk).update(logo=uni_data['logo'])
                uni.refresh_from_db()

            # Link a couple majors
            for major_name in ['Computer Science', 'Engineering']:
                m = major_objs[major_name]
                UniversityMajor.objects.get_or_create(university=uni, major=m, defaults={'is_active': True})

            if created:
                created_universities += 1

        self.stdout.write(self.style.SUCCESS(f"Seed complete. Universities created: {created_universities}"))
