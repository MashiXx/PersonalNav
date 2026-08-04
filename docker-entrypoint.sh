#!/bin/sh
set -e

# Bind mounts shadow the directories created at image build time, and the app
# writes uploads with sharp.toFile() without creating parents first.
mkdir -p /app/data \
         /app/dist/public/uploads/avatars \
         /app/dist/public/uploads/icons

exec "$@"
