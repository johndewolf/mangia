import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getUsers } from '~/models/user.server.js'
import Layout from "../../components/Layout";
export const loader = async() => {

  const users = await getUsers();

  return json({ users });
}

export default function UserIndexRoute() {

  const { users } = useLoaderData();
  return (
    <Layout>
      <h3 className="text-2xl font-bold">User Index Page</h3>
      <ul>
      { users.map((user) => {
        return (
          <li key={user.username}><Link to={`/user/${user.username}`}>{user.username}</Link></li>
        )
      }) }
      </ul>
    </Layout>
  );
}
