import { Link } from "@remix-run/react";
import Layout from "../components/Layout"
import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();
  return (
    <Layout>
      <h1>Welcome</h1>
    </Layout>
  );
}
