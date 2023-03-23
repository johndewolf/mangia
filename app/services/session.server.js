import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { authenticator } from "./auth.server";

export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getUser(request) {
  const user = await authenticator.isAuthenticated(request)
  if (user) return user;
  return undefined;
  // throw await logout(request);
}

export async function logout(request) {
  await authenticator.logout(request, { redirectTo: `https://${process.env.AUTH0_DOMAIN}/v2/logout?client_id=${process.env.AUTH0_CLIENTID}&returnTo=${process.env.AUTH0_LOGOUT}`,
});
}

export async function requireUserId(
  request,
  redirectTo = new URL(request.url).pathname
) {
  const user = await authenticator.isAuthenticated(request)
  if (!user) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return user;
}

export let { getSession, commitSession, destroySession } = sessionStorage;
