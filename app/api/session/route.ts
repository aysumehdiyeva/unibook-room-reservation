import { env } from "cloudflare:workers";
import {
  expiredSessionCookie,
  readSessionUser,
  sessionCookie,
} from "../../lib/session";

export async function GET(request: Request) {
  const userId = readSessionUser(request);
  if (!userId) return Response.json({ userId: null });

  const employee = await env.DB.prepare("SELECT id FROM employees WHERE id=?")
    .bind(userId)
    .first();

  return Response.json({ userId: employee ? userId : null });
}

export async function POST(request: Request) {
  const { userId } = (await request.json()) as { userId?: string };
  if (!userId)
    return Response.json({ error: "Choose an employee." }, { status: 400 });

  const employee = await env.DB.prepare("SELECT id FROM employees WHERE id=?")
    .bind(userId)
    .first();
  if (!employee)
    return Response.json({ error: "Employee not found." }, { status: 404 });

  return Response.json(
    { userId },
    { headers: { "Set-Cookie": sessionCookie(userId) } },
  );
}

export async function DELETE() {
  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": expiredSessionCookie() } },
  );
}
