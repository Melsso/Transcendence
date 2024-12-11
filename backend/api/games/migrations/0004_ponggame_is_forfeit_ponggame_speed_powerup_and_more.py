# Generated by Django 4.2.17 on 2024-12-10 14:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0003_delete_rrgame'),
    ]

    operations = [
        migrations.AddField(
            model_name='ponggame',
            name='is_forfeit',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='ponggame',
            name='speed_powerup',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='ponggame',
            name='attack_accuracy',
            field=models.FloatField(default=0.0),
        ),
    ]