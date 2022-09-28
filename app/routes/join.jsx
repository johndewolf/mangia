import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";

import { getUserId, createUserSession } from "~/session.server";

import { createUser, getUserByEmail, getUserByUsername } from "~/models/user.server";
import { safeRedirect, validateEmail } from "~/utils";

export const loader = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const username = formData.get("username");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

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

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json(
      { errors: { email: "A user already exists with this email" } },
      { status: 400 }
    );
  }

  const existingUsername = await getUserByUsername(username);
  if (existingUsername) {
    return json(
      { errors: { username: "A user already exists with this username" } },
      { status: 400 }
    );
  }


  const user = await createUser(email, password, username);

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo,
  });
};

export const meta = () => {
  return {
    title: "Sign Up",
  };
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData();
  const emailRef = React.useRef(null);
  const usernameRef = React.useRef(null);
  const passwordRef = React.useRef(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
    else if (actionData?.errors?.username) {
      usernameRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-screen w-full flex-col justify-center bg-cyan-100 items-center">
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
                <div className="text-error mt-2" id="email-error">
                  {actionData.errors.email}
                </div>
              )}
            </div>
            <div className="mt-4">
              <label
                  htmlFor="username"
                  className="label"
                >
                  Username
              </label>
              <input
                ref={usernameRef}
                id="username"
                required
                autoFocus={true}
                name="username"
                type="username"
                autoComplete="username"
                aria-invalid={actionData?.errors?.username ? true : undefined}
                aria-describedby="username-error"
                className="input input-bordered input-md block w-full"
              />

              {actionData?.errors?.username && (
                <div className="text-error mt-2" id="email-error">
                  {actionData.errors.username}
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
                autoComplete="new-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="input input-bordered input-md block w-full"
              />

              {actionData?.errors?.password && (
                <div className="text-error mt-2" id="password-error">
                  {actionData.errors.password}
                </div>
              )}
            </div>

            <div className="mt-4">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <button
                type="submit"
                className="btn btn-primary btn-block"
              >
                Create Account
              </button>
            </div>
            <div className="flex items-center justify-center mt-8">
              <div className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  className="text-blue-500 underline"
                  to={{
                    pathname: "/login",
                    search: searchParams.toString(),
                  }}
                >
                  Log in
                </Link>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
