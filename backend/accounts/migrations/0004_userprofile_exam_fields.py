from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_merge_20250909_1640'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='ielts_current_score',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='ielts_target_score',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='tolc_current_score',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='tolc_target_score',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='tolc_exam_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
