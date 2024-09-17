FROM python:3.9-slim-buster

WORKDIR /app

COPY . /app

RUN python -m pip install --upgrade pip

RUN pip install --no-cache-dir -r Transcendence/requirements.txt

EXPOSE 8000

RUN python3 Transcendence/manage.py migrate

CMD ["python", "Transcendence/manage.py", "runserver", "0.0.0.0:8000"]