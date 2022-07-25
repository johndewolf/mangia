import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useFetcher, useSubmit } from "@remix-run/react";
import * as React from "react";
import Layout from '~/components/Layout'

import { createRecipe, getRecipeBySlug, getIngredientSuggestion } from "~/models/recipe.server";
import { getUser, sessionStorage, getSession } from "~/session.server";
import slugify from "slugify";
import { HiX, HiPlus } from 'react-icons/hi'
import { Card } from 'flowbite-react'

const addBtnClasses = "rounded border-none flex items-center gap-1 py-2 px-4 text-blue-500 hover:text-white hover:bg-blue-600"

export const action = async ({ request }) => {
  console.log('hit action')
  const user = await getUser(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const isGetSuggestion = formData.get("isGetSuggestion");
  const steps = [];
  const ingredients = {};
  let slugifyTitle = slugify(title);

  for(const pair of formData.entries()) {
    const key = pair[0];
    const value = pair[1];

    if (key.indexOf('step-') > -1 && value !== '') {
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
  if (isGetSuggestion && user) {
    try {
      const ingredientValues = Object.values(ingredients);
      const ingredientNames = ingredientValues.reduce((ingredientString, ingredient) => ingredientString += ` ${ingredient.quantity} ${ingredient.metric} ${ingredient.body}`, '')
      const aiResponse = await(getIngredientSuggestion(ingredientNames))
      const firstChoice = aiResponse?.data?.choices[0]?.text;
      return json({suggestion: firstChoice})
    } catch (e) {
      console.log(e)
      return (json({errors: 'Problem getting suggestion'}))
    }
  }
  else {
    const existingRecipe = await getRecipeBySlug({slug: slugifyTitle})
    if (existingRecipe) {
      slugifyTitle = slugifyTitle + `-${Date.now()}`
    }
    if (typeof title !== "string" || title.length === 0) {
      return json({ errors: { title: "Title is required" } }, { status: 400 });
    }

    const recipe = await createRecipe({ title, ingredients: Object.values(ingredients), steps, userId: user.id, slug: slugifyTitle });
  
    const session = await getSession(request)
    session.flash(
      "globalMessage",
      `Recipe "${recipe.title}" successfully created`
    );
    return redirect(`/user/${user.username}/${recipe.slug}`,
      {headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      } 
    });
  }
};

export default function NewRecipe() {
  const actionData = useActionData();
  const fetcher = useFetcher();
  const submit = useSubmit()
  const titleRef = React.useRef(null);
  const formRef = React.useRef(null);
  const ingredientRefs = React.useRef([])
  const stepRefs = React.useRef([])
  
  const [ steps, updateSteps ] = React.useState([0]);
  const [ ingredients, updateIngredients ] = React.useState([{key: 0, metric: '', quantity: '', body: ''}]);


  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    }

    if (actionData?.suggestion) {
      console.log(actionData?.suggestion)
    }
  }, [actionData]);

  React.useEffect(() => {
    ingredientRefs.current[ingredients.length - 1].focus()
  }, [ingredients])


  React.useEffect(() => {
    stepRefs.current[steps.length - 1].focus()
  }, [steps])
  
  const handleAddStep = (e) => {
    e.preventDefault();
    const nextKey = steps[steps.length - 1] + 1;
    updateSteps([...steps, nextKey])
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

      console.log(ingredients)
    if (ingredients.length > 1) {
      const formData = new FormData(formRef.current)
      console.log('submitting')
      formData.append('isGetSuggestion', true)
      submit(formData, {replace: true, method: "post",})
    }
  }

  const handleRemoveIngredient = (e) => {
    const filteredIngredients = ingredients.filter((ingr) => ingr.key !== e)
    updateIngredients(filteredIngredients)
  }

  return (
    <Layout>
      <div style={{maxWidth: '48rem'}}>
        {actionData?.suggestion}
        <Card>
          <h1 className="text-xl text-bold">Create Your Recipe</h1>
          <hr />
          <Form
            method="post"
            ref={formRef}
            replace
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

            <div className="mt-8">
              <fieldset>
                <legend>Ingredients:</legend>
                <datalist id="metric-list">
                  <option value="cups"/>
                  <option value="ounces"/>
                  <option value="grams"/>
                  <option value="tablespoons"/>
                  <option value="teaspoons"/>
                  <option value="pinch"/>
                  <option value="handful"/>
                  <option value="handful"/>
                </datalist>
                {ingredients.map((ingr, index) => (
                  <div className="flex my-4" key={ingr.key}>
                    <input
                      type="number"
                      aria-label="ingredient quantity"
                      placeholder="quantity"
                      name={`ingredient-quantity-${ingr.key}`}
                      ref={(elem) => (ingredientRefs.current[index] = elem)}
                      style={{maxWidth: '7rem'}}
                      className="rounded-md border-2 border-gray-200 py-2 px-3"
                    />
                    <input
                      list="metric-list"
                      aria-label="ingredient metric"
                      placeholder="unit"

                      name={`ingredient-metric-${ingr.key}`}
                      className="rounded-md border-2 border-gray-200 py-2 px-3 ml-4 mr-4"
                    />
                    <input
                      type="text"
                      aria-label="ingredient body"
                      placeholder="ingredient"
                      className="rounded-md flex-1 border-2 border-gray-200 py-2 px-3"
                      name={`ingredient-body-${ingr.key}`}
                    />
                    
                    <button
                    type="button"
                    className="p-1 border rounded-full self-center ml-1 border-none"
                    disabled={ingredients.length < 2}
                    onClick={() => handleRemoveIngredient(ingr.key)}
                    >
                      <HiX color="red" />
                    </button>
                  </div>
                  ))}
                </fieldset>
              {actionData?.suggestion && <div className="text-sm italic">AI Suggestion: {actionData?.suggestion}</div>}
              <button type="button" onClick={() => handleAddIngredient()} className={addBtnClasses}><HiPlus /> Add ingredient</button>
            </div>
            <div className="mt-8" >
              <fieldset>
                <legend>Steps: </legend>
                
                {steps.map((step, index) => (
                  <div className="my-4 gap-1 flex relative" key={`step-${step}`}>
                  <textarea
                    name={`step-${step}`}
                    rows={8}
                    ref={(elem) => (stepRefs.current[index] = elem)}
                    className=" w-full flex-1 rounded-md border-2 border-gray-200 py-2 px-3"
                  />
                  <button
                  type="button"
                  className="p-1 border-none rounded-full self-start"
                  disabled={steps.length < 2}
                  onClick={() => handleRemoveStep(step)}
                >
                  <HiX className="" color="red" />
                </button>
                </div>
                ))}
                <button
                  onClick={handleAddStep}
                  className={addBtnClasses}
                >
                  <HiPlus /> Add Step
                </button>
              </fieldset>
            </div>

            <div className="text-right">
              <button
                type="submit"
                className="rounded ml-4 border-2 border-blue-500 bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
              >
                Create Recipe
              </button>
            </div>
          </Form>
        </Card>
      </div>
    </Layout>
  )
}
