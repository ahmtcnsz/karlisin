FROM node:22-alpine

WORKDIR /app

# Paket dosyalarını kopyala ve kurulumu yap
COPY package*.json ./
RUN npm ci

# Geri kalan tüm dosyaları kopyala
COPY . .

# Projeyi production için derle
RUN npm run build

# Uygulamanın çalışacağı port
EXPOSE 3000

# Express sunucusunu başlat
CMD ["npm", "start"]
