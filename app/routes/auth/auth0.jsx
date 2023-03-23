import { authenticator } from "~/services/auth.server";
import { redirect } from "@remix-run/node";

export let loader = () => redirect("/login");

export let action = ({ request }) => {
  return authenticator.authenticate("auth0", request);
};
