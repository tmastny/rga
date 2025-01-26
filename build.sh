#!/bin/bash

bun install
bun run build
# Copy build output to static folder
mkdir -p ../../static/rga
cp -r dist/* ../../static/rga/
