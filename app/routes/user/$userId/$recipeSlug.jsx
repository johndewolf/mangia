import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { getRecipeBySlug } from "~/models/recipe.server";
import { Link, useLoaderData } from "@remix-run/react";
import Layout from "~/components/Layout";
export const loader = async ({ request, params }) => {
  invariant(params.recipeSlug, "recipe slug not found");

  const recipe = await getRecipeBySlug({ slug: params.recipeSlug });

  if (!recipe) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ recipe });
};

export default function UserRecipeDetailsPage() {
  const {recipe} = useLoaderData();
  
  return (
    <Layout>
      <h1 className="text-2xl font-bold">{recipe.title} &mdash; <Link to={`/user/${recipe.user.username}`}>{recipe.user.username}</Link></h1>
      <hr className="my-4" />
      <p>{recipe.ingredients}</p>
      <hr className="my-4" />
      <ul>
        {recipe.steps.map((step) => (<li key={step.id}>{step.body}</li>))}
      </ul>
    </Layout>
  );
}
