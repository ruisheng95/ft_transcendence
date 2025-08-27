FROM alpine:3.21.3
RUN apk update && apk add --no-cache nodejs npm
RUN mkdir -p /app
WORKDIR /app
COPY . .
COPY env_example.txt /app/.env
RUN npm install
CMD ["npm", "start"]

#Testing purpose
#CMD ["tail", "-f", "/dev/null"]