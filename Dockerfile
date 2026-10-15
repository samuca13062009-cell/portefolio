# Imagem para alojamento (Render, Fly.io, Railway ou um servidor próprio).
FROM node:22-alpine
WORKDIR /app
COPY . .
ENV NODE_ENV=production
# Os dados que mudam (conteúdos editados, mensagens, conta) ficam num disco persistente montado em /data.
ENV DATA_DIR=/data
EXPOSE 4180
USER node
CMD ["node", "server.js"]
