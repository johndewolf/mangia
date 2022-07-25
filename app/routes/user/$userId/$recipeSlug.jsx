import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { createRecipeCheckInByUser, getRecipeBySlug, getRecipeCheckInsByUser } from "~/models/recipe.server";
import { Link, useLoaderData, useFetcher } from "@remix-run/react";
import Layout from "~/components/Layout";
import { getSession, sessionStorage, getUser } from "~/session.server";
import { HiCheck } from "react-icons/hi";
import { formatDate } from "~/utils";


export const action = async({request}) => {
  const user = await getUser(request);
  const formData = await request.formData();
  const recipeId = formData.get('recipeId')
  await createRecipeCheckInByUser({ userId: user.id, recipeId });
  return json({message: `Checkin created successfully`, status: 200})
}

export const loader = async ({ request, params }) => {
  invariant(params.recipeSlug, "recipe slug not found");
  const user = await getUser(request);
  const recipe = await getRecipeBySlug({ slug: params.recipeSlug });
  const userCheckIns = await getRecipeCheckInsByUser({recipeId: recipe.id, userId: user?.id})
  const session = await getSession(request);
  const message = session.get("globalMessage") || null;
  
  if (!recipe) {
    throw new Response("Not Found", { status: 404 });
  }
  
  return json(
    { user, recipe, message, userCheckIns},
    {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session)
      }
    }
  );
};
export default function UserRecipeDetailsPage() {
  const {user, recipe, message, userCheckIns} = useLoaderData();

  const date = formatDate(recipe.createdAt)
  return (
    <Layout message={message}>
      <div style={{maxWidth: '48rem'}}>
        <h1 className="text-2xl font-bold">{recipe.title}</h1>
        <h2 className="text-lg mt-4">Created By <Link to={`/user/${recipe.user.username}`} className="text-blue-400 underline">{recipe.user.username}</Link> on {date}</h2>
        {user && 
          <CheckInButton recipeId={recipe.id} userCheckIns={userCheckIns} />
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
    </Layout>
  );
}

const CheckInButton = ({recipeId, userCheckIns}) => {
  const fetcher = useFetcher();
  const checkInClicked = userCheckIns.length > 0;
  const checkinClass = `flex h-fit items-center gap-1 font-semibold ${checkInClicked ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"} rounded-full p-1.5 p-1 text-xs mt-4`
  const pluralTimes = `time${userCheckIns.length > 1 ? 's' : ''}`
  return (
    <fetcher.Form replace method="post">
      <input value={recipeId} name="recipeId" readOnly hidden />
      <button className={checkinClass} type="submit">
        <HiCheck /> {checkInClicked ? `You made this ${userCheckIns.length} ${pluralTimes}` : 'Did you make this recipe? Check in here' }
      </button>
    </fetcher.Form>
  )
}
