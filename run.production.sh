#!/bin/bash

# Set environment variables
export DATABASE_URL=""
export AUTH_ORIGIN=""
export AUTH_SECRET=""
export ICAL_USER=""
export ICAL_PASSWORD=""
export AP_IMG_UPLOAD_URL=""
export RENDER_SERVER_URL=""

# Start the server
node .output/server/index.mjs

# Catch any errors
if [ $? -ne 0 ]; then
    echo "The above error occurred. Press Enter to exit."
    read
fi
