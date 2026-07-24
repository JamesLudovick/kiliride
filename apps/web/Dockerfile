FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json apps/web/
COPY packages/types/package*.json packages/types/

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "--workspace", "apps/web", "run", "dev", "--", "--host", "0.0.0.0"]
