export async function GET() {
  return Response.json({ token: 'wss://echo.websocket.events' });
}
