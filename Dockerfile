FROM node:16.18.0
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . ./
EXPOSE 8080
CMD [ "npm","run", "devStart" ]