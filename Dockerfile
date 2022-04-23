FROM node:18

WORKDIR /financier
RUN yarn add express@^4.17.3 nocache@^3.0.3 uuid@^8.3.2 helmet-csp@^3.4.0 cheerio@^0.22.0

ADD ./dist /financier/dist
ADD ./docs /financier/docs
ADD ./api /financier/api

WORKDIR /financier/api

EXPOSE 8080

# RUN apt-get install -y git-core

CMD node ./index.js
