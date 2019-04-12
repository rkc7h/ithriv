FROM node:alpine as node
ENV APP_LOC /ithriv_web
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
WORKDIR $APP_LOC
COPY package*.json ./
RUN npm install -g @angular/cli
RUN npm install
RUN npm install source-map-explorer --save-dev
COPY . .
RUN npm run build_dev

FROM nginx:alpine
ENV APP_LOC /ithriv_web
RUN rm -rf /usr/share/nginx/html/*
COPY --from=node $APP_LOC/dist /usr/share/nginx/html
COPY ./nginx_app.conf /etc/nginx/conf.d/default.conf

