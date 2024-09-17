from django.http import HttpResponse

def homepage(request):
    return HttpResponse("Homepage!")

def loginpage(request):
    return HttpResponse("Hmmmmm... Should I let you in?")