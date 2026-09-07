# WebAccess

A web accessibility scanner that checks any public URL against 5 real WCAG (Web Content Accessibility Guidelines) rules and returns a structured violation report. Built because accessibility failures are invisible to sighted developers but concrete barriers for screen reader users.

## Live URLs

**Frontend:** http://webaccess-frontend-930271538018.s3-website.us-east-2.amazonaws.com

**API Base URL:** http://webaccess-alb-618707564.us-east-2.elb.amazonaws.com

**Interactive API docs:** http://webaccess-alb-618707564.us-east-2.elb.amazonaws.com/docs

## Architecture

```
Browser (React app on S3)
   │
   ▼
AWS S3 (static site hosting)
   │  serves index.html + JS/CSS assets
   │
   │  API calls (HTTP)
   ▼
AWS ALB (webaccess-alb, port 80)
   │  stable DNS, forwards to port 8000
   ▼
AWS ECS Fargate (webaccess-service)
   │  FastAPI app (uvicorn, port 8000)
   │  image: 930271538018.dkr.ecr.us-east-2.amazonaws.com/webaccess:latest
   ▼
AWS RDS (PostgreSQL, private subnet)
   │  scans table: id, url, scanned_at
   │  violations table: id, scan_id, check_type, description
```

**AWS Resources:**
- Region: `us-east-2`
- S3 Bucket: `webaccess-frontend-930271538018` (static site hosting)
- ECR: `930271538018.dkr.ecr.us-east-2.amazonaws.com/webaccess`
- ECS Cluster: `webaccess-cluster`
- ECS Service: `webaccess-service` (Fargate, 1 task)
- ALB: `webaccess-alb-618707564` — listener on port 80

## The 5 Accessibility Checks

Screen reader users navigate pages entirely by keyboard — they jump between headings, links, and form controls to build a mental map of a page. They can't see layout, color, or visual grouping. These five checks target the gaps that most commonly create real barriers.

### `missing_title`
Every page needs a `<title>` tag. Screen readers announce it when the page loads, and it's what shows in browser tabs and bookmarks. Without it, users have no way to orient themselves.

### `missing_alt_text`
Images without `alt` text are either silently skipped or read out as the raw filename by screen readers. Alt text should describe what the image communicates, not just what it shows. Images marked `aria-hidden="true"` are intentionally decorative and are correctly excluded.

### `heading_hierarchy`
Screen reader users frequently navigate by jumping between headings (`h1` → `h2` → `h3`). When levels are skipped — jumping from `h1` to `h3` — the document outline becomes incoherent. Users expect each deeper level to introduce a subsection of the one above it.

### `unlabeled_input`
Form inputs with no `<label>` (linked via `for`/`id`) and no `aria-label` are invisible to screen readers — the user hears "edit text" with no context. This check excludes hidden inputs, which are intentionally non-interactive.

### `vague_link_text`
Screen readers can list all links on a page. Link text like "click here", "read more", or "here" is meaningless in that context — users have no idea where the link goes. Descriptive link text is one of the highest-impact accessibility fixes.

## API Endpoints

| Method | Path | Request | Response |
|--------|------|---------|----------|
| `POST` | `/scan` | `{"url": "https://example.com"}` | `{scan_id, url, total_violations, violations: [{check_type, description}]}` |
| `GET` | `/scans?url=` | — | Array of past scans for the URL (newest first) |
| `GET` | `/scans/compare?url=` | — | `{url, latest_scan_id, previous_scan_id, newly_introduced: [...], fixed: [...]}` or `{message}` if fewer than 2 scans exist |

### Example

```bash
# Run a scan
curl -X POST http://webaccess-alb-618707564.us-east-2.elb.amazonaws.com/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Get scan history
curl "http://webaccess-alb-618707564.us-east-2.elb.amazonaws.com/scans?url=https://example.com"

# Compare the two most recent scans
curl "http://webaccess-alb-618707564.us-east-2.elb.amazonaws.com/scans/compare?url=https://example.com"
```

## Running Locally

**Backend:**
```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Set environment variables: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Deploying to AWS

### API (ECS)

```bash
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 930271538018.dkr.ecr.us-east-2.amazonaws.com
docker build -t webaccess .
docker tag webaccess:latest 930271538018.dkr.ecr.us-east-2.amazonaws.com/webaccess:latest
docker push 930271538018.dkr.ecr.us-east-2.amazonaws.com/webaccess:latest
aws ecs update-service --cluster webaccess-cluster --service webaccess-service --force-new-deployment --region us-east-2
```

### Frontend (S3)

```bash
cd frontend
npm run build
aws s3 sync dist/ s3://webaccess-frontend-930271538018 --delete
```
