import Layout from "~/components/Layout";
import invariant from "tiny-invariant";
import { getRecipesByUser, deleteRecipe } from '~/models/recipe.server.js'
import { json } from "@remix-run/node";
import { Link, useLoaderData, useFetcher } from "@remix-run/react";
import { getUser, requireUserId, getSession, sessionStorage } from "~/session.server.js"
import { Card, Dropdown } from "flowbite-react";


export const loader = async ({ request, params }) => {
  invariant(params.userId, "userId not found");
  const user = await getUser(request);
  const session = await getSession(request);
  const message = session.get("globalMessage") || null;
  const recipes = await getRecipesByUser({ username: params.userId });
  return json({ recipes, user, message }, {headers: {
    "Set-Cookie": await sessionStorage.commitSession(session),
  }});
};

export const action = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const recipeId = formData.get("recipeId");
  const session = await getSession(request)
  session.flash(
    "globalMessage",
    "Recipe deleted"
  );
  await deleteRecipe({ userId, id: recipeId });
  return json({message: `Recipe Deleted`, status: 200}, {headers: {
    "Set-Cookie": await sessionStorage.commitSession(session),
  }})
};

export default function UserDetailPage() {
  const { recipes, user, message } = useLoaderData();
  
  return (
    <Layout message={message}>
      <h1 className="text-2xl font-bold">Profile Page</h1>
      <div className="flex mt-8">
        <div className="max-w-md">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                Recipes
              </h3>
              </div>
              <div className="flow-root">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                { recipes.map(recipe => (
                  <RecipeItem recipe={recipe} user={user} key={recipe.id} />
                ))}
              </ul>
            </div>
            { user &&
              <Link to="/recipes/new" className="mt-4 self-start rounded border-2 border-blue-500 bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400">
              Create a Recipe
              </Link>
            }
          </Card>
        </div> 
        <div>

        </div>
      </div>
    </Layout>
  );
}


const RecipeItem = ({recipe, user}) => {
  const fetcher = useFetcher();

  return (
    <li className="hover:bg-blue-100 px-4" key={recipe.id}>
      <div className="flex items-center">
        <div className="flex-1">
          <Link to={recipe.slug} className="block py-2 sm:py-4">{recipe.title}</Link>
        </div>
        <div className="min-w-0 text-right">
          {user && 
            <Dropdown
              inline={true}
              label=""
            >
              <Dropdown.Item>
                <button
                  disabled
                  className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Edit
                </button>
              </Dropdown.Item>
              <Dropdown.Item>
                <fetcher.Form replace method="post">
                  <button
                    type="submit"
                    value={recipe.id}
                    name="recipeId"
                    className="block py-2 px-4 text-sm text-red-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Delete
                  </button>
                </fetcher.Form>
              </Dropdown.Item>
            </Dropdown>
          }
        </div>
      </div>
    </li>
  )
}
