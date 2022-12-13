import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { getUserByUsername } from "~/models/user.server.js"
import { createRecipeCheckInByUser, getRecipeBySlug, getRecipeCheckInsByUser } from "~/models/recipe.server";
import { getCollectionsByUser,createCollection, getCollectionWithRecipeByUser, deleteCollectionRecipeConnection, createCollectionRecipeConnection } from '~/models/collection.server'
import { Link, useLoaderData, useFetcher, useActionData } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/Layout";
import { getSession, sessionStorage, getUser } from "~/session.server";
import { HiOutlineCheckCircle, HiOutlineBookmark } from "react-icons/hi";
import { formatDate } from "~/utils";
import AddCollectionDrawer from "~/components/AddToCollectionDrawer";
import slugify from "slugify";

export const action = async({request, params}) => {
  const user = await getUser(request);
  const formData = await request.formData();
  const collectionName = formData.get('collection-name')
  const addRecipeToCollections = formData.get('add-recipe-to-collections')
  const recipeSlug = params.recipeSlug
  if (collectionName) {
    const slug = slugify(collectionName)
    await createCollection({slug: slug, title: collectionName, userId: user.id, recipeSlug})

    return json({message: `${collectionName} created successfully`, status: 200})
  }
  else if (addRecipeToCollections) {
    const recipe = await getRecipeBySlug({ slug: params.recipeSlug });
    const selectedCollections = formData.getAll('collection-id')
    const allCollections = formData.get('all-collections').split(',');
    const collectionsWithRecipe = await getCollectionWithRecipeByUser(user.id, recipe.id)
    const selectedCollectionsToUpdate = selectedCollections.filter((collection) => {
      return (
        collectionsWithRecipe.findIndex((ele) => ele.id === collection) < 0
      )
    })

    const unselectedCollections = allCollections.filter((collection) => {
      return (
        collection !== '' && selectedCollections.indexOf(collection) < 0 &&
        collectionsWithRecipe.findIndex((ele) => ele.id === collection) > -1
      )
    })

    try {
      await Promise.all(
        unselectedCollections.map(async (collection) => {
          await deleteCollectionRecipeConnection(collection, recipe.id)
        }),
        selectedCollectionsToUpdate.map(async (collection) => {
          await createCollectionRecipeConnection(collection, recipe.id)
        }),
      )
      return json({message: `Collections updated`, status: 200})
    }
    catch (error) {
      console.log(error)
      throw new Response("Big Error", { status: 500 });
    }
  }
  else {
    await createRecipeCheckInByUser({ userId: user.id, recipeSlug });
    return json({message: `Checkin created successfully`, status: 200})
  }
}

export const loader = async ({ request, params }) => {
  invariant(params.recipeSlug, "recipe slug not found");
  const user = await getUserByUsername(params.userId);
  const currentUser = await getUser(request);
  const recipe = await getRecipeBySlug({ slug: params.recipeSlug });
  let returnData = { user, recipe }

  if (currentUser) {
    const userCheckIns = await getRecipeCheckInsByUser({recipeId: recipe.id, userId: currentUser.id})
    const collections = await getCollectionsByUser(currentUser.username)

    returnData = {...returnData, userCheckIns, collections, currentUser}
  }
  
  const session = await getSession(request);
  const message = session.get("globalMessage") || null;
  returnData = {...returnData, message}
  if (!recipe) {
    throw new Response("Not Found", { status: 404 });
  }
  return json(
    returnData,
    {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session)
      }
    }
  );
};
export default function UserRecipeDetailsPage() {
  const {currentUser, recipe, message, userCheckIns, collections} = useLoaderData();
  const actionData = useActionData()
  const actionMessage  = actionData?.message || null
  const [ showModal, setShowModal ] = useState(false)
  const date = formatDate(recipe.createdAt)
  return (
    <Layout mainClasses="drawer drawer-end" message={message || actionMessage}>
      <input id="my-drawer" type="checkbox" className="drawer-toggle" checked={showModal} readOnly />
      <div className="drawer-content">  
        <div style={{maxWidth: '62rem'}} className="p-8">
          <div className="text-sm breadcrumbs mb-8">
            <ul>
              <li><Link to="/user">All Users</Link></li> 
              <li><Link to={`/user/${recipe.user.username}`}>{recipe.user.username}</Link></li> 
              <li>{recipe.title}</li>
            </ul>
          </div>
          <div className="flex items-center">
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{recipe.title}</h1>
              <h2 className="text-lg mt-4">Created By <Link to={`/user/${recipe.user.username}`} className="text-blue-400 underline">{recipe.user.username}</Link> on {date}</h2>
            </div>
          </div>
          {currentUser && 
            <UserActionButtons userCheckIns={userCheckIns} setShowModal={setShowModal}  />
          }
          <hr className="my-4" />
          <ul className="ml-8 list-disc">
          {recipe.ingredients.map((ingredient) => (<li key={ingredient.id}>{ingredient.quantity} {ingredient.metric} {ingredient.body}</li>))}
          </ul>
          {recipe?.steps.length > 0 &&
          <>
            <hr className="my-4" />
            <ol className="ml-8 list-decimal">
              {recipe.steps.map((step) => (<li key={step.id} className="mt-4">{step.body}</li>))}
            </ol>
          </>
          }
        </div>
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer" onClick={()=> setShowModal(false)} className="drawer-overlay"></label>
        <AddCollectionDrawer showModal={showModal} setShowModal={setShowModal} collections={collections} recipe={recipe} />
      </div>
    </Layout>
  );
}

const UserActionButtons = ({userCheckIns, setShowModal}) => {
  const fetcher = useFetcher();
  const pluralTimes = `time${userCheckIns?.length > 1 || userCheckIns.length === 0 ? 's' : ''}`
  return (
  <div className="mt-4 flex gap-4 justify-between">
    
      <fetcher.Form replace method="post">
      <div className="flex items-center">
        <button className="btn btn-ghost btn-circle text-primary text-xl" type="submit">
          <HiOutlineCheckCircle />
        </button>
        <p>You've made this recipe {userCheckIns?.length} {pluralTimes}</p>
      </div>
      </fetcher.Form>
    
    <button className="btn btn-ghost btn-circle text-primary text-xl" type="submit" onClick={() => setShowModal(true)}>
      <HiOutlineBookmark className="font" />
    </button>
  </div>
  )
}
