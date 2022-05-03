FROM node:lts-bullseye

ENV GH_TEAM_PERMISSIONS="admin"
ENV CF_SUPERADMIN_EMIAL="admin@local"

WORKDIR /home/node
COPY . .
RUN npm install

USER node

CMD [ "index.js" ]
