FROM node:14.16.1-alpine3.13

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV DB_CONNECTION=mongodb://productListUser:productListPassword@cb-mongodb:27017/promotions?authSource=admin 
ENV PORT=3050

EXPOSE 3050

CMD ["npm","start"]