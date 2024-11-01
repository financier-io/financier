FROM node:22

WORKDIR /financier
RUN corepack enable
RUN pnpm install express@^4.17.3 nocache@^4.0.0 uuid@^11.0.0 helmet@^8.0.0 cheerio@^1.0.0

ADD ./dist /financier/dist
ADD ./docs /financier/docs
ADD ./api /financier/api
ADD ./package.json /financier/package.json

WORKDIR /financier/api

EXPOSE 8080

# RUN apt-get install -y git-core

CMD ["node", "./index.js"]
