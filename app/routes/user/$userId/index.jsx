import Layout from "~/components/Layout";
import invariant from "tiny-invariant";
import { getRecipesByUser, deleteRecipe } from '~/models/recipe.server.js'
import { getUserByUsername, getUserCheckIns } from '~/models/user.server.js'
import { json } from "@remix-run/node";
import { Link, useLoaderData, useFetcher, useParams, useCatch } from "@remix-run/react";
import { getUser, requireUserId, getSession, sessionStorage } from "~/session.server.js"
import { Card, Dropdown, Table } from "flowbite-react";
import { formatDate } from "~/utils"

export const loader = async ({ request, params }) => {
  invariant(params.userId, "userId not found");
  const user = await getUser(request);
  const pageUser = await getUserByUsername(params.userId)
  if (!pageUser) {
    throw new Response("Not Found", { status: 404 });
  }
  const session = await getSession(request);
  const message = session.get("globalMessage") || null;
  const recipes = await getRecipesByUser({ username: params.userId });
  const checkIns = await getUserCheckIns({userId: pageUser.id})
  
  return json({ recipes, user, message, checkIns }, {headers: {
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

const noRecipesMessage = (isUser, username) => {
  if (isUser) {
    return 'You have no recipes! Create one now!'
  }
  else {
    return `${username} has yet to create a recipe`
  }
}
export default function UserDetailPage() {
  const { recipes, user, message, checkIns } = useLoaderData();
  const { userId } = useParams();
  const isUser = userId === user?.username;

  return (
    <Layout message={message}>
      <h1 className="text-2xl font-bold">Profile </h1>
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
                { recipes.length > 0 ?
                recipes.map(recipe => (
                  <RecipeItem recipe={recipe} isUser={isUser} key={recipe.id} />
                ))
                :
                noRecipesMessage(isUser, user.username)
                }

              </ul>
            </div>
            { isUser &&
              <Link to="/recipes/new" className="mt-4 self-start rounded border-2 border-blue-500 bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400">
              Create a Recipe
              </Link>
            }
          </Card>
        </div>
      </div>
      <div className="max-w-xl mt-12">
        <h3 className="text-xl mb-4 font-bold leading-none text-gray-900 dark:text-white">
          Recent Check Ins
        </h3>
        <Table>
          <Table.Head>
            <Table.HeadCell>
              Recipe
            </Table.HeadCell>
            <Table.HeadCell>
              Recipe Creator
            </Table.HeadCell>
            <Table.HeadCell>
              Check In Date
            </Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {checkIns.length > 0 ?
            checkIns.map(checkIn => (
              <Table.Row key={checkIn.id}>
                <Table.Cell><Link to={`/user/${checkIn.recipe.user.username}/${checkIn.recipe.slug}`}>{checkIn.recipe.title}</Link></Table.Cell>
                <Table.Cell><Link to={`/user/${checkIn.recipe.user.username}/`}>{checkIn.recipe.user.username}</Link></Table.Cell>
                <Table.Cell>{formatDate(checkIn.createdAt)}</Table.Cell>
              </Table.Row>
            ))
            :
            <Table.Row><Table.Cell colSpan={3}>No checkins!</Table.Cell></Table.Row>
            }
          </Table.Body>
        </Table>
      </div> 
    </Layout>
  );
}


const RecipeItem = ({recipe, isUser}) => {
  const fetcher = useFetcher();

  return (
    <li className="hover:bg-blue-100 px-4" key={recipe.id}>
      <div className="flex items-center">
        <div className="flex-1">
          <Link to={recipe.slug} className="block py-2 sm:py-4">{recipe.title}</Link>
        </div>
        <div className="min-w-0 text-right">
          {isUser && 
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

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return (
      <Layout>
        <h1 className="text-2xl font-bold">User not found!</h1>
      </Layout>
    );
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
