// API Route to proxy chat requests to Agent_Bot service
import { NextRequest, NextResponse } from 'next/server';

const AGENT_BOT_URL = process.env.AGENT_BOT_URL || 'http://localhost:8091';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();

    // Get the authorization header
    const authHeader = request.headers.get('authorization');

    // Forward the request to Agent_Bot service
    const response = await fetch(`${AGENT_BOT_URL}/api/v1/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify(body),
    });

    // Get the response data
    const data = await response.json();

    // Return the response with appropriate status
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Error proxying to Agent_Bot:', error);
    return NextResponse.json(
      { detail: 'Failed to connect to AI service' },
      { status: 500 }
    );
  }
}
