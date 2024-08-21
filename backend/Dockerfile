FROM python:3.9-slim-buster

WORKDIR /transcendent

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY . /transcendent/


EXPOSE 8000

RUN bash /transcendent/script.sh
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]