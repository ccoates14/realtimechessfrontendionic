# Base image
FROM node:20 as build-stage

# Set working directory
WORKDIR /src

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .
COPY ./assets ./dist/assets
# Serve stage
FROM nginx:stable-alpine as staging-stage
COPY --from=build-stage /src/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]