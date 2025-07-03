# Use Node.js LTS version with Alpine
FROM node:18-alpine3.20

# Install Python and build dependencies
RUN apk add --no-cache python3 py3-setuptools make g++ \
    && ln -sf python3 /usr/bin/python

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Expose the port your server uses
EXPOSE 5001

# Start the application
CMD ["npm", "start"]
