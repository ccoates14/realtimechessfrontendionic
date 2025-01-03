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
COPY ./images ./dist/images

# Serve stage
FROM nginx:stable-alpine as staging-stage
COPY --from=build-stage /src/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]