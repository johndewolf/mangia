import Layout from "~/components/Layout";
import invariant from "tiny-invariant";
import { getRecipesByUser, deleteRecipe } from '~/models/recipe.server.js'
import { getUserByUsername, getUserCheckIns } from '~/models/user.server.js'
import { json } from "@remix-run/node";
import { Link, useLoaderData, useFetcher, useParams, useCatch } from "@remix-run/react";
import { getUser, requireUserId, getSession, sessionStorage } from "~/session.server.js"
import { Accordion, Card, Dropdown, Table } from "flowbite-react";
import { formatDate } from "~/utils"

import { getCollectionsByUser } from '~/models/collection.server'
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
  const collections = await getCollectionsByUser(params.userId)
  return json({ recipes, user, message, checkIns, collections }, {headers: {
    "Set-Cookie": await sessionStorage.commitSession(session),
  }});
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  console.log('hit actions')
  const recipeId = formData.get("recipeId");
  const session = await getSession(request)
  session.flash(
    "globalMessage",
    "Recipe deleted"
  );
  await deleteRecipe(recipeId);
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
  const { recipes, user, message, checkIns, collections } = useLoaderData();
  const { userId } = useParams();
  const isUser = userId === user?.username;

  return (
    <Layout message={message}>
      <div className="text-sm breadcrumbs mb-8">
        <ul>
          <li><Link to="/user">All Users</Link></li> 
          <li>{userId}</li> 
        </ul>
      </div>
      <h1 className="text-3xl font-bold">{userId}</h1>

      <section className="border-b border-solid border-slate-200 pb-4">
        <h2 className="text-2xl leading-none text-gray-900 dark:text-white mt-8">
          Recipes
        </h2>
        <div className="flex flex-row flex-wrap mt-4 gap-4">
          { recipes.length > 0 ?
          recipes.map(recipe => (
            <RecipeItem recipe={recipe} user={user} key={recipe.id} />
          ))
          :
            noRecipesMessage(isUser, userId)
          }
        </div>
        { isUser &&
          <Link to="/recipes/new" className="btn btn-primary mt-8 ml-auto">
          Create a Recipe
          </Link>
        }
      </section>



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

      <div className="max-w-xl mt-12">
        <h3 className="text-xl mb-4 font-bold leading-none text-gray-900 dark:text-white">
          Collections
        </h3>
        
            {collections && collections.length > 0 ?
            <Accordion>
            {collections.map(collection => (
              <Accordion.Panel key={collection.id}>
                <Accordion.Title>
                  {collection.title}
                </Accordion.Title>
                
                <Accordion.Content>
                { collection.recipes && collection.recipes.length > 0 ?
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {collection.recipes.map(recipe => (
                  <RecipeItem recipe={recipe.recipe} user={user} key={`collection-${recipe.recipe.id}`} />
                ))}
                </ul>
                 : <p className="text-sm italic">Collection has no recipes</p> }
                
                </Accordion.Content>
              </Accordion.Panel>
            ))}
            </Accordion>
            :
            <p>No collections yet!</p>
            }
        
      </div>

    </Layout>
  );
}


const RecipeItem = ({recipe, user}) => {
  const fetcher = useFetcher();
  const username = user?.username
  const isUser = recipe.user.username === username;
  return (
    <div className="card w-96 bg-base-100 shadow-xl card-bordered">
      <div className="card-body">
        <div className="flex flex-row justify-between">
          <div className="card-title">
            <Link to={recipe.slug} className="block py-2 sm:py-4">{recipe.title}</Link>
          </div>
          {isUser && 
          <div className="dropdown dropdown-left">
            <label tabIndex={0} className="btn btn-ghost m-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M10.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
              </svg>
            </label>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <fetcher.Form replace method="post">
                  <button
                      type="submit"
                      value={recipe.id}
                      name="recipeId"
                      className="block w-full text-sm text-red-600"
                    >
                      Delete
                  </button>
                </fetcher.Form>
              </li>
              <li>
                <button
                  disabled
                  className="block text-sm text-gray-700"
                >
                  Edit
                </button>
              </li>
            </ul>
          </div>
          }
        </div>
      </div>
    </div>
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
