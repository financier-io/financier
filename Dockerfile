FROM node:wheezy

ADD . /financier

WORKDIR /financier

EXPOSE 8080

ENV NODE_ENV=production

RUN apt-get install -y git-core

RUN npm install -g gulp bower && \
    npm install && \
    bower install --allow-root && \
    npm run-script compile

CMD npm start
