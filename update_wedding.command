#!/bin/bash
cd "$(dirname "$0")"
python3 update_wedding.py
echo ""
echo "Opening updated invitations in your default browser..."
open "index.html"
open "demo.html"
