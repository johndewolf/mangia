import { json } from "@remix-run/node";
import {  useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getUserByUsername } from '~/models/user.server.js'

export const loader = async ({ request, params }) => {
  invariant(params.userId, "userId not found");

  const user = await getUserByUsername( params.userId );
  if (!user) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ user });
};


export default function NoteDetailsPage() {
  const data = useLoaderData();

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.user.username}</h3>
    </div>
  );
}

export function ErrorBoundary({ error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>User not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
