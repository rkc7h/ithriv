FROM python:3.7.3-stretch
ENV APP_LOC /ithriv_service
RUN mkdir -p /root/.aws
RUN mkdir -p /home/.aws
RUN mkdir -p /etc/private/ithriv
RUN mkdir -p $APP_LOC
WORKDIR $APP_LOC
ADD ./requirements.txt .
RUN pip3 install -r requirements.txt
EXPOSE 80
EXPOSE 443
RUN apt-get update
RUN apt-get install -y libmagic-dev
RUN apt-get install -y nginx
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
RUN apt-get install -y supervisor
ENV FLASK_APP app/__init__.py
ENV FLASK_DEBUG 1
CMD ["./wait-for-it.sh", "ithriv_es:9200", "--", "supervisord"]
