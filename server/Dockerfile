FROM python:3.3.6

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

RUN useradd -ms /bin/bash app
USER app

CMD [ "python", "-c", "import this" ]
