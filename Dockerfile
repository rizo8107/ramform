# Build stage
FROM node:20-alpine as build

WORKDIR /app

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_WHATSAPP_PHONE_NUMBER_ID
ARG VITE_WHATSAPP_BUSINESS_ACCOUNT_ID
ARG VITE_WHATSAPP_ACCESS_TOKEN

COPY package*.json ./
RUN npm ci

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
