export const SESSION_COOKIE = "unibook_demo_user";

export function readSessionUser(request: Request) {
  const cookies = request.headers.get("cookie") ?? "";
  const match = cookies
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${SESSION_COOKIE}=`));

  return match
    ? decodeURIComponent(match.slice(SESSION_COOKIE.length + 1))
    : null;
}

export function sessionCookie(userId: string) {
  return `${SESSION_COOKIE}=${encodeURIComponent(userId)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`;
}

export function expiredSessionCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
}
