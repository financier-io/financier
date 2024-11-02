FROM node:22

RUN corepack enable

WORKDIR /financier

ADD ./dist /financier/dist
ADD ./docs /financier/docs
ADD ./api /financier/api
ADD ./package.json /financier/package.json

WORKDIR /financier/api

RUN pnpm install --production

EXPOSE 8080

CMD ["node", "./index.js"]
