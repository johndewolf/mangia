import Layout from "~/components/Layout";
import invariant from "tiny-invariant";
import { getRecipesByUser, deleteRecipe } from '~/models/recipe.server.js'
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useActionData } from "@remix-run/react";
import { getUser, requireUserId } from "~/session.server.js"
import { Card, Dropdown } from "flowbite-react";

export const loader = async ({ request, params }) => {
  invariant(params.userId, "userId not found");
  const user = await getUser(request);
  const recipes = await getRecipesByUser({ username: params.userId });
  return json({ recipes, user });
};

export const action = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const recipeId = formData.get("recipeId");
  await deleteRecipe({ userId, id: recipeId });
  return json({message: `Recipe Deleted`, status: 200})
};

export default function UserDetailPage() {
  const { recipes, user } = useLoaderData();
  const actionData = useActionData();
  return (
    <Layout>
      {/* fire toast */}
      {actionData?.status === 200 && <div>Recipe Deleted</div>}

      <h1 className="text-2xl font-bold">Profile Page</h1>
      <div className="max-w-md mt-8">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
            Recipes
          </h3>
          </div>
          <div className="flow-root">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            { recipes.map((recipe) => {
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
                          <Form method="post" replace>
                          <button
                            type="submit"
                            value={recipe.id}
                            name="recipeId"
                            className="block py-2 px-4 text-sm text-red-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            Delete
                          </button>
                          </Form>
                        </Dropdown.Item>
                      </Dropdown>
                    }
                  </div>
                </div>
            </li>
            )
          }) }
          </ul>
        </div>
      </Card>
      </div>
    </Layout>
  );
}
