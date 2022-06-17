import { redirect } from "@remix-run/node";
import { logout } from "~/session.server";

export const action = async ({ request }) => {
  await logout(request);
  return redirect("/");
};

export const loader = async () => {
  return redirect("/");
};
