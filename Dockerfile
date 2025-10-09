# Build stage
FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_WHATSAPP_PHONE_NUMBER_ID
ARG VITE_WHATSAPP_BUSINESS_ACCOUNT_ID
ARG VITE_WHATSAPP_ACCESS_TOKEN

# Native/CLI build deps for packages like gifsicle/imagemin
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    autoconf \
    automake \
    libtool \
    nasm \
    pkgconfig \
    bash \
    git \
    gifsicle \
    libc6-compat

COPY package*.json ./
# Use npm ci when package-lock.json is present; otherwise fallback to npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

# Write env for Vite build (only VITE_ keys are embedded)
RUN printf "VITE_SUPABASE_URL=%s\nVITE_SUPABASE_ANON_KEY=%s\nVITE_WHATSAPP_PHONE_NUMBER_ID=%s\nVITE_WHATSAPP_BUSINESS_ACCOUNT_ID=%s\nVITE_WHATSAPP_ACCESS_TOKEN=%s\n" \
  "$VITE_SUPABASE_URL" "$VITE_SUPABASE_ANON_KEY" "$VITE_WHATSAPP_PHONE_NUMBER_ID" "$VITE_WHATSAPP_BUSINESS_ACCOUNT_ID" "$VITE_WHATSAPP_ACCESS_TOKEN" \
  > .env.production

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
