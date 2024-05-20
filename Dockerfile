# Dockerfile
# Pull official Node.js image from Docker Hub
FROM node:bullseye-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install
#Run install cors
#RUN npm install cors --save
#RUN npm install http-errors --save

#Run Audit Fix
#RUN npm audit fix

# Bundle app source
#COPY ./server/ ./
COPY . .

# Expose container port 3000
EXPOSE 3000

#install pm2
RUN npm install pm2 -g

# Run "start" script in package.json
#CMD ["npm", "start"]

#Run app on pm2
CMD ["npm", "start"]
