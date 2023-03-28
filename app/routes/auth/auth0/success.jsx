import { authenticator } from "~/services/auth.server";
import { redirect } from "@remix-run/node";

export let loader = async ({request}) => {
  const user =  await authenticator.isAuthenticated(request);
  return redirect(`/user/${user.username}`)
};
