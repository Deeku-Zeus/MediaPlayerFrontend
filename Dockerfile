# Use Node.js as base image
FROM node:20

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the application files
COPY . .

# Build the app
RUN npm run build

# Expose port 3000 and start the app
EXPOSE 3000
CMD ["npm", "run", "preview"]