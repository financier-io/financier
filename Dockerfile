FROM node:22

RUN corepack enable

WORKDIR /financier

ADD ./dist /financier/dist
ADD ./docs /financier/docs
ADD ./api /financier/api

WORKDIR /financier/api

RUN pnpm install --prod --frozen-lockfile

EXPOSE 8080

CMD ["node", "./index.js"]
