import requests
from bs4 import BeautifulSoup

url = "https://en.wikipedia.org/wiki/Web_accessibility"

headers = {
    "User-Agent": "WebAccessScanner/1.0 (educational project; contact: your_email@example.com)"
}

response = requests.get(url, headers=headers)
print(f"Status code: {response.status_code}")

soup = BeautifulSoup(response.text, "html.parser")
images = soup.find_all("img")
print(f"Found {len(images)} images total")

for img in images:
    if img.get("aria-hidden") == "true":
        continue  # intentionally hidden from screen readers, not a violation
    alt_text = img.get("alt")
    if not alt_text:
        print(f"Missing alt text: {img}")