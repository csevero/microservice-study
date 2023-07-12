FROM node:18.15.0
WORKDIR /var/www
COPY . .
RUN npm ci
CMD ["npm", "run", "dev"]