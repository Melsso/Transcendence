import secrets
from django.core.mail import send_mail
from django.conf import settings

# Create your views here.

def generate_verification_code(length=6):
    return secrets.token_hex(length)[:length]

def send_verification_email(email, code):
    subject = 'Your Verification Code'
    message = f'Your verification code is: {code}'
    send_mail(subject, message, settings.EMAIL_HOST_USER, [email])