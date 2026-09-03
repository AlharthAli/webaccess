from fastapi import FastAPI
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup

app = FastAPI()

headers = {
    "User-Agent": "WebAccessScanner/1.0 (educational project; contact: alharthali610@gmail.com)"
}

class ScanRequest(BaseModel):
    url: str

@app.post("/scan")
def scan_website(request: ScanRequest):
    response = requests.get(request.url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    violations = []

    # Check 1: Missing page title
    if soup.title is None or not soup.title.text.strip():
        violations.append("Missing page title")

    # Check 2: Missing alt text
    images = soup.find_all("img")
    for img in images:
        if img.get("aria-hidden") == "true":
            continue
        alt_text = img.get("alt")
        if not alt_text:
            violations.append(f"Missing alt text: {img}")

    # Check 3: Heading hierarchy
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
                violations.append(f"Heading level skipped: went from h{prev} to h{curr}")

    # Check 4: Unlabeled form inputs
    inputs = soup.find_all("input")
    for inp in inputs:
        if inp.get("type") == "hidden":
            continue
        if inp.get("aria-label"):
            continue

        input_id = inp.get("id")

        if not input_id:
            violations.append(f"Unlabeled input (no id at all): {inp}")
            continue

        matching_label = soup.find("label", attrs={"for": input_id})

        if matching_label is None:
            violations.append(f"Unlabeled input (no matching label): {inp}")

    # Check 5: Non-descriptive link text
    vague_phrases = ["click here", "read more", "here", "more", "link"]
    links = soup.find_all("a")
    for link in links:
        link_text = link.text.lower().strip()
        if link_text in vague_phrases:
            violations.append(f"Non-descriptive link text: '{link.text}'")

    return {
        "url": request.url,
        "total_violations": len(violations),
        "violations": violations
    }
    