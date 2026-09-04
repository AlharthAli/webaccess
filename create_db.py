import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD")
)

cursor = conn.cursor()

cursor.execute("""
    CREATE TABLE scans (
        id SERIAL PRIMARY KEY,
        url TEXT,
        scanned_at TIMESTAMP
    )
""")

cursor.execute("""
    CREATE TABLE violations (
        id SERIAL PRIMARY KEY,
        scan_id INTEGER REFERENCES scans(id),
        check_type TEXT,
        description TEXT
    )
""")

conn.commit()
conn.close()