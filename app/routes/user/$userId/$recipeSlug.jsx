import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { getRecipeBySlug } from "~/models/recipe.server";
import { Link, useLoaderData } from "@remix-run/react";
import Layout from "~/components/Layout";
import { getSession, sessionStorage } from "~/session.server";

export const loader = async ({ request, params }) => {
  invariant(params.recipeSlug, "recipe slug not found");

  const recipe = await getRecipeBySlug({ slug: params.recipeSlug });
  const session = await getSession(request);
  const message = session.get("globalMessage") || null;
  
  if (!recipe) {
    throw new Response("Not Found", { status: 404 });
  }
  
  return json(
    { recipe, message },
    {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session)
      }
    }
  );
};

export default function UserRecipeDetailsPage() {
  const {recipe, message} = useLoaderData();
  const date = new Date(recipe.createdAt).toLocaleDateString('en-us', { year:"numeric", month:"long", day:"numeric"}) 
  return (
    <Layout message={message}>
      <div style={{maxWidth: '48rem'}}>
        <h1 className="text-2xl font-bold">{recipe.title}</h1>
        <h2 className="text-lg mt-4">Created By <Link to={`/user/${recipe.user.username}`} className="text-blue-400 underline">{recipe.user.username}</Link> on {date}</h2>
        <hr className="my-4" />
        <ul className="list-disc">
        {recipe.ingredients.map((ingredient) => (<li key={ingredient.id}>{ingredient.quantity} {ingredient.metric} {ingredient.body}</li>))}
        </ul>
        {recipe?.steps.length > 0 &&
        <>
          <hr className="my-4" />
          <ol className="list-decimal">
            {recipe.steps.map((step) => (<li key={step.id} className="mt-4">{step.body}</li>))}
          </ol>
        </>
        }
      </div>
    </Layout>
  );
}
