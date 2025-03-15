FROM node:lts-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --force
COPY . .
RUN npm run build --production
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/automobile /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
