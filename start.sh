#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}Sistema de Control de Asistencia${NC}"
echo -e "${GREEN}====================================${NC}"

# Check if Node.js is installed
if ! [ -x "$(command -v node)" ]; then
  echo -e "${RED}Error: Node.js is not installed.${NC}" >&2
  echo -e "Please install Node.js from https://nodejs.org/"
  exit 1
fi

# Check if npm is installed
if ! [ -x "$(command -v npm)" ]; then
  echo -e "${RED}Error: npm is not installed.${NC}" >&2
  echo -e "Please install npm (usually comes with Node.js)"
  exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d "v" -f 2)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d "." -f 1)
if [ "$NODE_MAJOR_VERSION" -lt 16 ]; then
  echo -e "${YELLOW}Warning: You are using Node.js v$NODE_VERSION${NC}"
  echo -e "${YELLOW}It is recommended to use Node.js v16.x or higher${NC}"
fi

echo -e "${GREEN}Starting application...${NC}"
echo -e "${YELLOW}Using production API at https://api.v2.lexy.cl${NC}"
echo ""

# Start the application
npm start
