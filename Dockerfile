FROM node:26.12.1

RUN npm install --global corepack@0.36.0 && corepack enable

WORKDIR /financier

ADD ./dist /financier/dist
ADD ./docs /financier/docs
ADD ./api /financier/api

WORKDIR /financier/api

RUN pnpm install --prod --frozen-lockfile

EXPOSE 8080

CMD ["node", "./index.js"]
