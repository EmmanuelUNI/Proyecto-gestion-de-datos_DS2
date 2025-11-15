FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


FROM nginx:alpine


COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template


RUN apk add --no-cache gettext


EXPOSE 80

CMD envsubst < /etc/nginx/templates/nginx.conf.template \
    > /etc/nginx/conf.d/default.conf \
    && nginx -g "daemon off;"

