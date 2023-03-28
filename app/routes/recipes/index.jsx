import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getRecipes } from '~/models/recipe.server.js'
import Layout from "../../components/Layout";

export const loader = async({request}) => {
  const recipes = await getRecipes();
  return json({ recipes });
}

export default function RecipeIndexRoute() {
  const { recipes } = useLoaderData();

  return (
    <Layout>

      <h1 className="text-2xl font-bold">Recipes Index Page</h1>
      <ul className="list-disc ml-8">
        {recipes.map((recipe) => (<li className="pl-4" key={recipe.id}><Link className="text-blue-600 underline" to={recipe.id}>{recipe.title}</Link></li>))}
      </ul>
    </Layout>
  );
}
