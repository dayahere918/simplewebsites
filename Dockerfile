# Use the official Node.js 20 image as the base
FROM mcr.microsoft.com/playwright:v1.42.1-jammy

# Set the working directory
WORKDIR /app

# Copy package.json and root config files
COPY package.json jest.config.js playwright.config.js ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV BASE_URL=https://stacky.pages.dev
ENV CI=true

# Default command: run all tests and generate coverage
CMD ["npm", "test", "--", "--coverage"]
