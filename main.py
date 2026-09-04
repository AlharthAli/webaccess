from fastapi import FastAPI
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
import psycopg2
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = FastAPI()

headers = {
    "User-Agent": "WebAccessScanner/1.0 (educational project; contact: alharthali610@gmail.com)"
}

def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )

class ScanRequest(BaseModel):
    url: str

@app.post("/scan")
def scan_website(request: ScanRequest):
    response = requests.get(request.url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    violations = []

    if soup.title is None or not soup.title.text.strip():
        violations.append({"check_type": "missing_title", "description": "Missing page title"})

    images = soup.find_all("img")
    for img in images:
        if img.get("aria-hidden") == "true":
            continue
        alt_text = img.get("alt")
        if not alt_text:
            violations.append({"check_type": "missing_alt_text", "description": f"Missing alt text: {img}"})

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
                violations.append({"check_type": "heading_hierarchy", "description": f"Heading level skipped: went from h{prev} to h{curr}"})

    inputs = soup.find_all("input")
    for inp in inputs:
        if inp.get("type") == "hidden":
            continue
        if inp.get("aria-label"):
            continue

        input_id = inp.get("id")

        if not input_id:
            violations.append({"check_type": "unlabeled_input", "description": f"Unlabeled input (no id at all): {inp}"})
            continue

        matching_label = soup.find("label", attrs={"for": input_id})

        if matching_label is None:
            violations.append({"check_type": "unlabeled_input", "description": f"Unlabeled input (no matching label): {inp}"})

    vague_phrases = ["click here", "read more", "here", "more", "link"]
    links = soup.find_all("a")
    for link in links:
        link_text = link.text.lower().strip()
        if link_text in vague_phrases:
            violations.append({"check_type": "vague_link_text", "description": f"Non-descriptive link text: '{link.text}'"})

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO scans (url, scanned_at) VALUES (%s, %s) RETURNING id",
        (request.url, datetime.now())
    )
    new_scan_id = cursor.fetchone()[0]

    for v in violations:
        cursor.execute(
            "INSERT INTO violations (scan_id, check_type, description) VALUES (%s, %s, %s)",
            (new_scan_id, v["check_type"], v["description"])
        )

    conn.commit()
    conn.close()

    return {
        "scan_id": new_scan_id,
        "url": request.url,
        "total_violations": len(violations),
        "violations": violations
    }
    