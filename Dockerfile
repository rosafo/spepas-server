FROM node:20.9.0

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Build TypeScript files
RUN npm run build

# Expose any ports your app is listening on
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
