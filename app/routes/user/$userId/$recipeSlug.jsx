import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { createRecipeCheckInByUser, getRecipeBySlug, getRecipeCheckInsByUser } from "~/models/recipe.server";
import { getCollectionsByUser,createCollection, getCollectionWithRecipeByUser, deleteCollectionRecipeConnection, createCollectionRecipeConnection } from '~/models/collection.server'
import { Link, useLoaderData, useFetcher, useActionData } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/Layout";
import { getSession, sessionStorage, getUser } from "~/session.server";
import { HiCheck, HiOutlineStar } from "react-icons/hi";
import { formatDate } from "~/utils";
import AddCollectionModal from "~/components/AddCollectionModal";

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
  const user = await getUser(request);
  const recipe = await getRecipeBySlug({ slug: params.recipeSlug });
  const userCheckIns = await getRecipeCheckInsByUser({recipeId: recipe.id, userId: user?.id})
  const session = await getSession(request);
  const message = session.get("globalMessage") || null;
  const collections = await getCollectionsByUser(user.username)
  if (!recipe) {
    throw new Response("Not Found", { status: 404 });
  }
  
  return json(
    { user, recipe, message, userCheckIns, collections},
    {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session)
      }
    }
  );
};
export default function UserRecipeDetailsPage() {
  const {user, recipe, message, userCheckIns, collections} = useLoaderData();
  const actionData = useActionData()
  const actionMessage  = actionData?.message || null
  const [ showModal, setShowModal ] = useState(false)
  const date = formatDate(recipe.createdAt)
  return (
    <Layout message={message || actionMessage}>
      <div style={{maxWidth: '48rem'}}>
        <div className="flex items-center">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{recipe.title}</h1>
            <h2 className="text-lg mt-4">Created By <Link to={`/user/${recipe.user.username}`} className="text-blue-400 underline">{recipe.user.username}</Link> on {date}</h2>
          </div>
          <HiOutlineStar title="add to collecion" onClick={() => setShowModal(true)} />
        </div>
        {user && 
          <CheckInButton userCheckIns={userCheckIns}  />
        }
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
      <AddCollectionModal showModal={showModal} setShowModal={setShowModal} collections={collections} recipe={recipe} />
    </Layout>
  );
}

const CheckInButton = ({userCheckIns}) => {
  const fetcher = useFetcher();
  const checkInClicked = userCheckIns.length > 0;
  const checkinClass = `flex h-fit items-center gap-1 font-semibold ${checkInClicked ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"} rounded-full p-1.5 p-1 text-xs mt-4`
  const pluralTimes = `time${userCheckIns.length > 1 ? 's' : ''}`
  return (
    <fetcher.Form replace method="post">
      <button className={checkinClass} type="submit">
        <HiCheck /> {checkInClicked ? `You made this ${userCheckIns.length} ${pluralTimes}` : 'Did you make this recipe? Check in here' }
      </button>
    </fetcher.Form>
  )
}
