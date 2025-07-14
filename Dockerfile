# Use the official Node.js image as the base image
FROM node:14-alpine

# Install git
RUN apk add --no-cache git

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

#ARG REACT_APP_API_URL
ARG PORT=3000  # Default to 3000 if not provided
#ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV PORT=${PORT}

# Copy the rest of the application code to the working directory
COPY . .

# Build the React application
RUN npm run build

# Install a simple HTTP server to serve the static files
RUN npm install -g serve

# Set environment variable for the port
#ARG REACT_APP_PORT=5000
#ENV PORT $REACT_APP_PORT
# Pass build arguments

# Expose the port the app runs on
EXPOSE ${PORT}
#EXPOSE 3000

# Command to run the application
#CMD ["serve", "-s", "build", "-l", "5000"]
CMD ["npm", "start"]