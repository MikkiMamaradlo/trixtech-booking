#!/bin/bash
# Generate a secure JWT secret for production use

echo "Generating secure JWT secret..."
if command -v openssl &> /dev/null; then
  echo "Using OpenSSL:"
  openssl rand -base64 32
else
  echo "Using Node.js:"
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
fi

echo ""
echo "Copy the output above and set it as JWT_SECRET in your .env file"
