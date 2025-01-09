FROM node:22
# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./
RUN npm install
RUN npm run build

WORKDIR /backend

RUN npm install

ENV PORT=3000

EXPOSE 3000
EXPOSE 8080

CMD ["npm", "start"]