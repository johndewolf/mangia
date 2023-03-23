import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";
import Layout from "../components/Layout"
import { getUser } from "~/services/session.server";
import { verifyLogin } from "~/models/user.server";
import { safeRedirect, validateEmail } from "~/utils";

export const loader = async ({ request }) => {
  const userId = await getUser(request);
  if (userId) return redirect("/");
  return json({});
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const remember = formData.get("remember");

  if (!validateEmail(email)) {
    return json({ errors: { email: "Email is invalid" } }, { status: 400 });
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { password: "Password is too short" } },
      { status: 400 }
    );
  }

  const user = await verifyLogin(email, password);
  if (!user) {
    return json(
      { errors: { email: "Invalid email or password" } },
      { status: 400 }
    );
  }

  const redirectTo = safeRedirect(formData.get("redirectTo"), `/user/${user.username}`);
  return redirectTo;
  // return createUserSession({
  //   request,
  //   userId: user.id,
  //   remember: remember === "on" ? true : false,
  //   redirectTo,
  // });
};

export const meta = () => {
  return {
    title: "Login",
  };
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const actionData = useActionData();
  const emailRef = React.useRef(null);
  const passwordRef = React.useRef(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Layout mainClasses="flex min-h-screen w-full flex-col justify-center bg-cyan-100 items-center">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <Form method="post">
          <div>
            <label
              htmlFor="email"
              className="label"
            >
              Email address
            </label>

            <input
              ref={emailRef}
              id="email"
              required
              autoFocus={true}
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={actionData?.errors?.email ? true : undefined}
              aria-describedby="email-error"
              className="input input-bordered input-md block w-full"
            />

            {actionData?.errors?.email && (
              <div className="text-error mt-2 text-sm" id="email-error">
                {actionData.errors.email}
              </div>
            )}

          </div>

          <div className="mt-4">
            <label
              htmlFor="password"
              className="label"
            >
              Password
            </label>
            
            <input
              id="password"
              ref={passwordRef}
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={actionData?.errors?.password ? true : undefined}
              aria-describedby="password-error"
              className="input input-bordered input-md block w-full"
            />

            {actionData?.errors?.password && (
              <div className="text-error text-sm mt-2" id="password-error">
                {actionData.errors.password}
              </div>
            )}

          </div>
          {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} /> }
          <button
            type="submit"
            className="btn btn-primary btn-block mt-4"
          >
            Log in
          </button>

            <div className="flex items-center mt-4">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="checkbox"
              />

              <label
                htmlFor="remember"
                className="label ml-2"
              >
                Remember me
              </label>
            </div>
            <div className="text-center text-sm text-gray-500 mt-8">
              Don't have an account?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/join",
                  search: searchParams.toString(),
                }}
              >
                Sign up
              </Link>
            </div>
          </Form>
          <Form action="/auth/auth0" method="post">
            <button>Login with Auth0</button>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
