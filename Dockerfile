# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

# Runtime: static files served by `serve`
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve --no-audit --no-fund
COPY --from=build /app/build ./build
ARG PORT=3000
ENV PORT=${PORT}
EXPOSE ${PORT}
CMD ["sh", "-c", "serve -s build -l ${PORT}"]
