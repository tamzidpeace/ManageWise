#!/bin/bash

# Script to run tests with the correct environment setup

# Check if Next.js server is already running
if pgrep -f "next dev" > /dev/null; then
  echo "Stopping existing Next.js server..."
  pkill -f "next dev"
  sleep 2
fi

# Start Next.js server with test database
echo "Starting Next.js server with test database..."
MONGODB_URI=mongodb://localhost:27017/inventory-pos-test npm run dev &

# Wait for server to start
echo "Waiting for server to start..."
sleep 5

# Run tests
echo "Running tests..."
npx jest "$@"

# Capture test result
TEST_RESULT=$?

# Stop the Next.js server
echo "Stopping Next.js server..."
pkill -f "next dev"

exit $TEST_RESULT