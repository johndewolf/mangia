import { authenticator } from "~/services/auth.server";

export let loader = async (props) => {
  const { request } = props;
  return authenticator.authenticate("auth0", request, {
    successRedirect: '/auth/auth0/success',
    failureRedirect: "/login",
  });
};
