FROM alpine:3.21.3
RUN apk update && apk add --no-cache npm nginx openssl
RUN mkdir -p /app
WORKDIR /app
COPY . .
COPY env_example.txt /app/.env
EXPOSE 3000 3001
RUN npm install
RUN npm run build
RUN chmod +x entrypoint.sh
COPY nginx.conf /etc/nginx/http.d/nginx.conf
ENTRYPOINT ["./entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

#Testing purpose
#CMD ["tail", "-f", "/dev/null"]