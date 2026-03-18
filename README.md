<div align="center">
  <img src="readme-assets/Analytics%20API%20Logo.svg" alt="Analytics API Logo" width="150" />
  <h1>Analytics API</h1>
</div>

A lightweight, serverless web analytics API built with Cloudflare Workers, TypeScript, and a D1 SQL database. This API collects user interactions and automatically appends rich geolocation and device data using Cloudflare's built-in request headers.

## Features

- **Serverless Architecture:** Runs on Cloudflare's global edge network for ultra-low latency.
- **Automatic Enrichment:** Extracts Country, City, IP Address, and Device Type directly from Cloudflare request headers.
- **Built-in OpenAPI Spec:** Automatically serves its own OpenAPI 3.0 documentation.
- **Fast Execution:** Uses Bun as the package manager for lightning-fast installs and script execution.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- [Bun](https://bun.sh/)
- A Cloudflare account
- Wrangler CLI (installed via Bun dependencies)

---

## Setup Instructions

**1. Install Dependencies**
Install the project packages using Bun:

```bash
bun install
```

**2. Create the D1 Database**
Create a new D1 database named `analytics-api` on your Cloudflare account:

```bash
bunx wrangler d1 create analytics-api
```

_Note: Copy the `database_id` output from this command._

**3. Update Configuration**
Open `wrangler.jsonc` and replace `YOUR-DATABASE-ID-HERE` with the ID generated in the previous step.

**4. Initialize the Database Schema**
Apply the SQL schema to create the `events` table.

To apply it locally (for development):

```bash
bunx wrangler d1 execute analytics-api --local --file=./schema.sql
```

To apply it remotely (for production):

```bash
bunx wrangler d1 execute analytics-api --remote --file=./schema.sql
```

---

## Development

To start the local development server:

```bash
bun run dev
```

The worker will typically be available at `http://localhost:8787`.

### Code Formatting

This project uses Prettier for consistent code styling.

- **Format all files:** `bun run format`
- **Check formatting:** `bun run format:check`

---

## Deployment

Deploy your worker to Cloudflare's edge network:

```bash
bun run deploy
```

---

## API Reference

### `POST /track`

Records a web analytics event.

**Expected JSON Payload:**

```json
{
	"session_id": "optional-anonymous-id",
	"event_type": "pageview",
	"page_url": "[https://example.com/home](https://example.com/home)",
	"extra_data": {
		"source": "twitter"
	}
}
```

### `GET /openapi.json`

Returns the OpenAPI 3.0 specification for this API. You can import this file into tools like Postman, Insomnia, or Swagger UI.
