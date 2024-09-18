FROM node:18.20.4-alpine3.20

RUN env

RUN mkdir -p /opt/charlie-demo/

COPY / /opt/charlie-demo/

RUN cd /opt/charlie-demo/server && npm run build-prod

RUN mv /opt/charlie-demo/client/build /opt/charlie-demo/server/dist/client

EXPOSE 27321

WORKDIR /opt/charlie-demo/server
CMD [ "npm", "start" ]