FROM alpine:3.21.3
RUN apk update && apk add --no-cache npm nginx openssl
RUN mkdir -p /app
WORKDIR /app
COPY . .
COPY env_example.txt /app/.env
RUN --mount=type=secret,id=google_client_id_secret,env=GOOGLE_CLIENT_ID,required=true sed -i "/VITE_GOOGLE_SIGN_IN_API=/c\VITE_GOOGLE_SIGN_IN_API=$GOOGLE_CLIENT_ID" /app/.env
RUN sed -i '/VITE_SOCKET_URL=/c\VITE_SOCKET_URL=wss:\/\/localhost:3000' /app/.env
RUN sed -i '/VITE_BACKEND_API_HOST=/c\VITE_BACKEND_API_HOST=https:\/\/localhost:3000' /app/.env
EXPOSE 3000 3001
RUN npm install
RUN npm run build
RUN chmod +x entrypoint.sh
COPY nginx.conf /etc/nginx/http.d/nginx.conf
ENTRYPOINT ["./entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

#Testing purpose
#CMD ["tail", "-f", "/dev/null"]