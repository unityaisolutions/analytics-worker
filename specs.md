# Analytics API Specification

This document outlines the usage of the Analytics API, designed to collect and store web interaction events. The API is hosted on Cloudflare Workers and leverages built-in Cloudflare properties to automatically enrich event data with geolocation and device details without requiring client-side computation.

## Base URL

`https://analytics-api.<your-cloudflare-username>.workers.dev`

> **Note:** Replace `<your-cloudflare-username>` with your actual Cloudflare Workers subdomain, or your custom domain if you have mapped one.

---

## Endpoints

### 1. Track Event

Records a user interaction, such as a page view or a button click.

- **Method:** `POST`
- **Path:** `/track`
- **Content-Type:** `application/json`

#### Request Body Parameters

| Parameter    | Type   | Required | Description                                                                     |
| :----------- | :----- | :------- | :------------------------------------------------------------------------------ |
| `event_type` | String | **Yes**  | The type of event being tracked (e.g., `pageview`, `click`, `signup`).          |
| `page_url`   | String | **Yes**  | The full URL of the page where the event occurred.                              |
| `session_id` | String | No       | An anonymous identifier for the user's current session.                         |
| `extra_data` | Object | No       | A JSON object containing custom key-value pairs relevant to the specific event. |

#### Auto-Collected Data

In addition to the payload provided in the POST request, the API automatically extracts and stores the following information from Cloudflare's edge headers:

- **IP Address:** Captured from the `CF-Connecting-IP` header.
- **Location:** Country and City extracted from the `request.cf` object.
- **Device Type:** Categorized as `desktop`, `mobile`, or `tablet` based on the incoming `User-Agent` string.

#### Example Request (JavaScript)

```javascript
fetch('https://analytics-api.<your-username>.workers.dev/track', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
	},
	body: JSON.stringify({
		session_id: 'sess_987654321',
		event_type: 'button_click',
		page_url: '[https://mywebsite.com/pricing](https://mywebsite.com/pricing)',
		extra_data: {
			button_id: 'upgrade-pro-plan',
			time_on_page_ms: 12500,
		},
	}),
});
```

#### Example Responses

**200 OK** (Success)

```json
{
	"status": "ok"
}
```

**405 Method Not Allowed** (If a GET request is sent to `/track`)

```text
Method Not Allowed
```

**500 Internal Server Error** (If the database insertion fails)

```json
{
	"error": "Internal Server Error"
}
```

---

### 2. OpenAPI Specification

Retrieves the OpenAPI 3.0 schema for this API. Useful for importing into tools like Postman, Insomnia, or rendering a Swagger UI.

- **Method:** `GET`
- **Path:** `/openapi.json`

#### Example Request

```bash
curl https://analytics-api.<your-username>.workers.dev/openapi.json
```

#### Example Response

**200 OK**
_(Returns the full OpenAPI 3.0 JSON object)._
