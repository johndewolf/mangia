import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import Layout from '~/components/Layout'
import { createRecipe } from "~/models/recipe.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const ingredients = formData.get("ingredients");
  const steps = [];

  for(const pair of formData.entries()) {
    const key = pair[0];
    const value = pair[1];

    if (key.indexOf('step-') > -1) {
      steps.push({body: value})
    }
  }
  console.log('in action: ', steps)
  if (typeof title !== "string" || title.length === 0) {
    return json({ errors: { title: "Title is required" } }, { status: 400 });
  }

  if (typeof ingredients !== "string" || ingredients.length === 0) {
    return json({ errors: { body: "Ingredients are required" } }, { status: 400 });
  }

  await createRecipe({ title, ingredients, steps, userId });
  //will redirect to specific recipe after slug for url is added
  return redirect(`/recipes`);
};

export default function NewRecipe() {
  const actionData = useActionData();
  const titleRef = React.useRef(null);
  const ingredientsRef = React.useRef(null);
  const [ steps, updateSteps ] = React.useState(['']);

  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.ingredients) {
      ingredientsRef.current?.focus();
    }
  }, [actionData]);
  
  const handleStepClick = (e) => {
    e.preventDefault();
    updateSteps([...steps, ''])
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
            />
          </label>
          {actionData?.errors?.ingredients && (
            <div className="pt-1 text-red-700" id="ingredients-error">
              {actionData.errors.ingredients}
            </div>
          )}
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
