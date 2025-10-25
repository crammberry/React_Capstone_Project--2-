#!/bin/bash

echo "Starting build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if vite is available
echo "Checking Vite installation..."
npx vite --version

# Run build
echo "Running build with npx vite build..."
npx vite build

echo "Build completed successfully!"
