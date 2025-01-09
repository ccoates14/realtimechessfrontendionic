FROM node:22

COPY package*.json ./

RUN npm install
RUN npm run build

WORKDIR /backend

RUN npm install

COPY . .

ENV PORT=3000

EXPOSE 3000
EXPOSE 8080

CMD ["npm", "start"]