FROM mcr.microsoft.com/playwright

WORKDIR /BestBuyer
COPY . .
RUN npm install --production

USER pwuser
ENV NODE_ENV=production
ENTRYPOINT node server.js
