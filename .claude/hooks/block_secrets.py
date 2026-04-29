#!/usr/bin/env python3
import json
import sys

BLOCKED_PATTERNS = [".env", ".config.yaml"]

data = json.load(sys.stdin)
raw = json.dumps(data)

if any(p in raw for p in BLOCKED_PATTERNS):
    sys.stderr.write("Error: Access to secrets files is not allowed.\n")
    sys.exit(2)  # Block the tool
