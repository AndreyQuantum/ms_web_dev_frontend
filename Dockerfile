# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_PRODUCTS_API_URL=/api/products
ARG VITE_ORDERS_API_URL=/api/orders
ENV VITE_PRODUCTS_API_URL=$VITE_PRODUCTS_API_URL
ENV VITE_ORDERS_API_URL=$VITE_ORDERS_API_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
