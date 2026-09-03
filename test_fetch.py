import requests
from bs4 import BeautifulSoup

url = "https://en.wikipedia.org/wiki/Web_accessibility"

headers = {
    "User-Agent": "WebAccessScanner/1.0 (educational project; contact: alharthali610@gmail.com)"
}

response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.text, "html.parser")

if soup.title is None or not soup.title.text.strip():
    print("Missing page title")

images = soup.find_all("img")
for img in images:
    if img.get("aria-hidden") == "true":
        continue
    alt_text = img.get("alt")
    if not alt_text:
        print(f"Missing alt text: {img}")

headings = soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6"])
levels = []
for h in headings:
    level = int(h.name[1])
    levels.append(level)

for i in range(1, len(levels)):
    prev = levels[i - 1]
    curr = levels[i]
    if curr > prev:
        if curr - prev != 1:
            print(f"Heading level skipped: went from h{prev} to h{curr}")

inputs = soup.find_all("input")
for inp in inputs:
    if inp.get("type") == "hidden":
        continue
    if inp.get("aria-label"):
        continue

    input_id = inp.get("id")

    if not input_id:
        print(f"Unlabeled input (no id at all): {inp}")
        continue

    matching_label = soup.find("label", attrs={"for": input_id})

    if matching_label is None:
        print(f"Unlabeled input (no matching label): {inp}")

vague_phrases = ["click here", "read more", "here", "more", "link"]

links = soup.find_all("a")
for link in links:
    link_text = link.text.lower()
    link_text = link_text.strip()

    if link_text in vague_phrases:
        print(f"Non-descriptive link text: '{link.text}'")