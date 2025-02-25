FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

ENV NODE_ENV=development
ENV HOST="0.0.0.0"

CMD ["npm", "run", "dev"]
