FROM node:10.4.1-alpine

ENV HOST=spreader.plark.io
ENV PORT=80
ENV SECURE=true

ENV DATABASE_NAME=plark
ENV DATABASE_USERNAME=root
ENV DATABASE_PASSWORD=root
ENV DATABASE_HOST=localhost
ENV DATABASE_PORT=5432

RUN apk add --no-cache gettext git python g++ make

WORKDIR /var/www/

COPY . .

RUN npm install
RUN npm run build:prod

RUN envsubst < /var/www/build/.env.template.yml > /var/www/.env.yml

EXPOSE 80

#CMD /bin/sh -c "envsubst < /var/www/build/.env.template.yml > /var/www/.env.yml && npm start"
CMD /bin/sh -c "npm start"