FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json apps/api/
COPY packages/types/package*.json packages/types/

RUN apk add --no-cache openssl \
  && npm install

COPY . .

EXPOSE 4000

CMD ["npm", "--workspace", "apps/api", "run", "start:dev"]
