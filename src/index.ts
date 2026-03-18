export interface Env {
	DB: D1Database;
}

interface AnalyticsPayload {
	session_id?: string;
	event_type: string;
	page_url: string;
	extra_data?: any;
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

// OpenAPI 3.0 Specification
const openApiSpec = {
	openapi: '3.0.0',
	info: {
		title: 'Web Analytics API',
		version: '1.0.0',
		description: 'A lightweight API to collect user interactions and device data, stored in Cloudflare D1.',
	},
	servers: [
		{
			url: '/', // Relative URL assuming the spec is served from the same domain
			description: 'Current Environment',
		},
	],
	paths: {
		'/track': {
			post: {
				summary: 'Track a user event',
				description: 'Records a web analytics event and automatically appends Cloudflare geolocation and device data.',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								required: ['event_type', 'page_url'],
								properties: {
									session_id: { type: 'string', description: 'Anonymous session identifier' },
									event_type: { type: 'string', description: 'Type of event (e.g., pageview, click)' },
									page_url: { type: 'string', description: 'The URL where the event occurred' },
									extra_data: { type: 'object', description: 'Any custom JSON data to attach to the event' },
								},
							},
						},
					},
				},
				responses: {
					'200': {
						description: 'Event successfully tracked',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: { status: { type: 'string', example: 'ok' } },
								},
							},
						},
					},
					'405': { description: 'Method Not Allowed' },
					'500': { description: 'Internal Server Error' },
				},
			},
		},
	},
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		try {
			const url = new URL(request.url);

			// --- NEW: Serve the OpenAPI Specification ---
			if (request.method === 'GET' && url.pathname === '/openapi.json') {
				return new Response(JSON.stringify(openApiSpec), {
					status: 200,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			// --- EXISTING: Analytics Tracking Endpoint ---
			if (request.method === 'POST' && url.pathname === '/track') {
				const payload: AnalyticsPayload = await request.json();

				const userAgent = request.headers.get('User-Agent') || 'unknown';
				const ipAddress = request.headers.get('CF-Connecting-IP') || 'unknown';
				const country = (request.cf?.country as string) || 'unknown';
				const city = (request.cf?.city as string) || 'unknown';

				let deviceType = 'desktop';
				if (/Mobi|Android/i.test(userAgent)) deviceType = 'mobile';
				if (/Tablet|iPad/i.test(userAgent)) deviceType = 'tablet';

				const extraDataStr = payload.extra_data ? JSON.stringify(payload.extra_data) : null;

				const { success } = await env.DB.prepare(
					`INSERT INTO events (session_id, event_type, page_url, user_agent, ip_address, country, city, device_type, extra_data) 
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				)
					.bind(
						payload.session_id || null,
						payload.event_type,
						payload.page_url,
						userAgent,
						ipAddress,
						country,
						city,
						deviceType,
						extraDataStr,
					)
					.run();

				if (success) {
					return new Response(JSON.stringify({ status: 'ok' }), {
						status: 200,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					});
				} else {
					throw new Error('Database insert failed');
				}
			}

			return new Response('Not Found', { status: 404, headers: corsHeaders });
		} catch (error) {
			console.error('Analytics Error:', error);
			return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}
	},
};
