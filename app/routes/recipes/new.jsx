import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSubmit } from "@remix-run/react";
import * as React from "react";
import Layout from '~/components/Layout'
import { createRecipe, getRecipeBySlug, getIngredientSuggestion } from "~/models/recipe.server";
import { getUser } from "~/session.server";
import slugify from "slugify";

export const action = async ({ request }) => {
  const user = await getUser(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const ingredients = formData.get("ingredients");
  const isGetSuggestion = formData.get("getSuggestion")
  const steps = [];

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
  }

 
  if (isGetSuggestion && user) {
    try {
      const aiResponse = await(getIngredientSuggestion(ingredients))
      const firstChoice = aiResponse?.data?.choices[0]?.text;
      return json({suggestion: firstChoice})
    } catch (e) {
      console.log(e)
      return (json({errors: 'Problem getting suggestion'}))
    }
    
    
  }
  else {
    if (typeof title !== "string" || title.length === 0) {
      return json({ errors: { title: "Title is required" } }, { status: 400 });
    }

    if (typeof ingredients !== "string" || ingredients.length === 0) {
      return json({ errors: { body: "Ingredients are required" } }, { status: 400 });
    }
    const recipe = await createRecipe({ title, ingredients, steps, userId: user.id, slug: slugifyTitle });
    return redirect(`/user/${user.username}/${recipe.slug}`);
  }
};

export default function NewRecipe() {
  const actionData = useActionData();
  const submit = useSubmit();
  const formRef = React.useRef(null);
  const titleRef = React.useRef(null);
  const ingredientsRef = React.useRef(null);
  const [ steps, updateSteps ] = React.useState(['']);

  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.ingredients) {
      ingredientsRef.current?.focus();
    }

    if (actionData?.suggestion) {
      console.log(actionData?.suggestion)
    }
  }, [actionData]);
  
  const handleStepClick = (e) => {
    e.preventDefault();
    updateSteps([...steps, ''])
  } 

  const handleIngredientChange = (e) => {
    const ingredients = e.target.value.split(' ');
    const lastLetter = e.target.value[e.target.value.length - 1]
    if (ingredients.length > 3 && lastLetter === ' ') {
      const formData = new FormData(formRef.current)
      formData.append('getSuggestion', 'true')
      submit(formData, {method: "post", action: "/recipes/new"})
    }
  }

  return (
    <Layout>
      <Form
        method="post"
        ref={formRef}
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
          <label className="flex w-full flex-col gap-1">
            <span>Ingredients: </span>
            <textarea
              ref={ingredientsRef}
              name="ingredients"
              rows={8}
              className="w-full flex-1 rounded-md border-2 border-gray-200 py-2 px-3 text-lg leading-6"
              aria-invalid={actionData?.errors?.ingredients ? true : undefined}
              aria-errormessage={
                actionData?.errors?.ingredients ? "ingredients-error" : undefined
              }
              onChange={handleIngredientChange}
            />
          </label>
          {actionData?.errors?.ingredients && (
            <div className="pt-1 text-red-700" id="ingredients-error">
              {actionData.errors.ingredients}
            </div>
          )}
          {actionData?.suggestion &&
          <label className="flex w-full flex-col gap-1">
            <span>Suggested Ingredient: </span>
            <textarea
              name="ingredients"
              value={actionData.suggestion}
              rows={8}
              readOnly
              className="w-full flex-1 rounded-md border-2 border-gray-200 py-2 px-3 text-lg leading-6"
              aria-invalid={actionData?.errors?.ingredients ? true : undefined}
              aria-errormessage={
                actionData?.errors?.ingredients ? "ingredients-error" : undefined
              }
            />
          </label>
          }
        </div>
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Steps: </span>
            {steps.map((step, index) => (
              <textarea
                key={`step-${index}`}
                name={`step-${index}`}
                rows={8}
                className="w-full flex-1 rounded-md border-2 border-gray-200 py-2 px-3 text-lg leading-6"
              />
            ))}

          </label>
        </div>

        <div className="text-right">
          <button
            onClick={handleStepClick}
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
