# Stage 1: Build the frontend
FROM node:22 AS build-frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Setup the backend
FROM node:22
WORKDIR /app
COPY --from=build-frontend /app/dist ./dist
COPY backend/package.json backend/package-lock.json backend/server.js ./backend/
RUN cd backend && npm install
WORKDIR /app/backend
CMD ["npm", "run", "start"]