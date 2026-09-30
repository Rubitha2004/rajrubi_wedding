#!/bin/bash
cd "$(dirname "$0")"
python3 update_wedding.py
echo ""
echo "Starting local preview server..."
python3 preview.py

