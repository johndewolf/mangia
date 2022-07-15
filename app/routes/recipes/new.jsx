import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import Layout from '~/components/Layout'
import { createRecipe, getRecipeBySlug } from "~/models/recipe.server";
import { getUser } from "~/session.server";
import slugify from "slugify";
import { TextInput } from "flowbite-react"
import { v4 as uuidv4 } from "uuid";

export const action = async ({ request }) => {
  const user = await getUser(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const steps = [];
  const ingredients = {};
  let slugifyTitle = slugify(title);
  const existingRecipe = await getRecipeBySlug({slug: slugifyTitle})
  if (existingRecipe) {
    slugifyTitle = slugifyTitle + `-${Date.now()}`
  }
  for(const pair of formData.entries()) {
    const key = pair[0];
    const value = pair[1];

    if (key.indexOf('step-') > -1) {
      steps.push({body: value})
    }
    if (key.indexOf('ingredient-') > -1) {
      const ingredientKeys = key.split('-');
      if (!ingredients[ingredientKeys[2]]) {
        ingredients[ingredientKeys[2]] = {}
      }
      ingredients[ingredientKeys[2]][ingredientKeys[1]] = value;
    }
  }

  if (typeof title !== "string" || title.length === 0) {
    return json({ errors: { title: "Title is required" } }, { status: 400 });
  }
  console.log(Object.values(ingredients))
  return json({a: 1})
  // const recipe = await createRecipe({ title, ingredients: Object.values(ingredients), steps, userId: user.id, slug: slugifyTitle });
  // return redirect(`/user/${user.username}/${recipe.slug}`);
};

export default function NewRecipe() {
  const actionData = useActionData();
  const titleRef = React.useRef(null);
  const ingredientsRef = React.useRef(null);
  const [ steps, updateSteps ] = React.useState(['step-1']);
  const [ ingredients, updateIngredients ] = React.useState([{key: 0, metric: '', quantity: '', body: ''}]);

  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.ingredients) {
      ingredientsRef.current?.focus();
    }
  }, [actionData]);
  
  const handleAddStep = (e) => {
    e.preventDefault();
    updateSteps([...steps, uuidv4()])
  }

  const handleRemoveStep = (e) => {
    const filteredSteps = steps.filter((step) => step !== e)
    updateSteps(filteredSteps)
  }

  const handleAddIngredient = () => {
    const nextKey = ingredients[ingredients.length - 1]['key'] + 1;
    updateIngredients(
      [...ingredients,
        {key: nextKey, metric: '', quantity: '', body: ''}
      ])
  }

  const handleRemoveIngredient = (e) => {
    const filteredIngredients = ingredients.filter((ingr) => ingr.key !== e)
    updateIngredients(filteredIngredients)
  }

  return (
    <Layout>
      <Form
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
          maxWidth: '40rem'
        }}
      >
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Title: </span>
            <input
              ref={titleRef}
              name="title"
              className="flex-1 rounded-md border-2 border-gray-200 px-3 text-lg leading-loose"
              aria-invalid={actionData?.errors?.title ? true : undefined}
              aria-errormessage={
                actionData?.errors?.title ? "title-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.title && (
            <div className="pt-1 text-red-700" id="title-error">
              {actionData.errors.title}
            </div>
          )}
        </div>

        <div>
          <fieldset>
            <legend>Ingredients</legend>
            
            {ingredients.map((ingr) => (
              <div className="flex" key={ingr.key}>
                <input
                  type="number"
                  aria-label="ingredient quantity"
                  placeholder="quantity"
                  name={`ingredient-quantity-${ingr.key}`}
                />
                <input
                  type="text"
                  aria-label="ingredient metric"
                  placeholder="metric"
                  name={`ingredient-metric-${ingr.key}`}
                />
                <input
                  type="text"
                  aria-label="ingredient body"
                  placeholder="ingredient"
                  name={`ingredient-body-${ingr.key}`}
                />
                <button
                type="button"
                className="secondary"
                onClick={() => handleRemoveIngredient(ingr.key)}
                >
                  X
                </button>
              </div>
              ))}
            </fieldset>
          <button type="button" onClick={() => handleAddIngredient()}>Add ingredient</button>
        </div>
        <div>
          <label className="flex gap-1">
            <span>Steps: </span>
            
            {steps.map((step) => (
              <div className="flex" key={`step-${step}`}>
              <textarea
                name={`step-${step}`}
                rows={8}
                className="w-full flex-1 rounded-md border-2 border-gray-200 py-2 px-3 text-lg leading-6"
              />
              <button
              type="button"
              className="secondary"
              onClick={() => handleRemoveStep(step)}
            >
              X
            </button>
            </div>
            ))}
            
          </label>
        </div>

        <div className="text-right">
          <button
            onClick={handleAddStep}
            className="rounded border-2 border-blue-500 py-2 px-4 text-blue-500 hover:bg-blue-600"
          >
            Add Step
          </button>
          <button
            type="submit"
            className="rounded ml-4 border-2 border-blue-500 bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Save
          </button>
        </div>
      </Form>
    </Layout>
  );
}
