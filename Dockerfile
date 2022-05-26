FROM node:14-slim

ENV NODE_ENV production
ENV PORT 4000

WORKDIR /app

COPY . .

RUN npm i
RUN npm run build

CMD node dist/bin/run-server.js \
  --port $PORT \
  --mongoUrl $MONGO_URL \
  --schemaPath $SCHEMA_PATH
