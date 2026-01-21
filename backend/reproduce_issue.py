import emoji
import sys

print(f"Emoji version: {emoji.__version__}")

try:
    text = "Hello 😡 world"
    print(f"Original: {text}")
    # The line from routes.py
    clean_text = emoji.demojize(text, delimiters=(" ", " "))
    print(f"Demojized: '{clean_text}'")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
