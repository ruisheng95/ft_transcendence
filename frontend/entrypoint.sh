#!/bin/sh
set -e  # Exit on error

# Generate certificate if it doesn't exist
if [ ! -f /etc/nginx/ssl/selfsigned.crt ]; then
    mkdir -p /etc/nginx/ssl
    openssl req -quiet -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/selfsigned.key \
        -out /etc/nginx/ssl/selfsigned.crt \
        -subj "/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
fi


# Replaces shell with CMD in Dockerfile (nginx becomes PID 1. Very important for Docker)
exec "$@"