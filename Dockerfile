FROM nginx:1.27-alpine

COPY index.html fonts.css style.css app.js /usr/share/nginx/html/
COPY fonts /usr/share/nginx/html/fonts/

EXPOSE 80
