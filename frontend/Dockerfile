# Use official Node.js lightweight LTS image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server accessible from host machine
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
