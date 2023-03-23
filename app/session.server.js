import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
// import { getSession } from "./services/session.server";
invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

const USER_SESSION_KEY = "userId";

export async function getSession(request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getUserId(request) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get(USER_SESSION_KEY);

  return userId;
}

export async function requireUserId(
  request,
  redirectTo = new URL(request.url).pathname
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}


export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}
