import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSubmit } from "@remix-run/react";
import {useEffect, useState, useRef} from "react";
import Layout from '~/components/Layout'
import { createRecipe, getRecipeBySlug, getIngredientSuggestion } from "~/models/recipe.server";
import { getSession, sessionStorage, getUser } from "~/services/session.server";
import slugify from "slugify";
import { HiX } from 'react-icons/hi'

export const loader = async ({ request, params }) => {
  const user = await getUser(request);
  if (!user) {
    return redirect('/')
  }
  return null;
}


export const action = async ({ request }) => {
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
  
    const session = await getSession(request.headers.get("Cookie"))
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
  const submit = useSubmit()
  const titleRef = useRef(null);
  const formRef = useRef(null);
  const ingredientRefs = useRef([])
  const stepRefs = useRef([])
  
  const [ steps, updateSteps ] = useState([0]);
  const [ ingredients, updateIngredients ] = useState([{key: 0, metric: '', quantity: '', body: ''}]);


  useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    }

    if (actionData?.suggestion) {
      console.log(actionData?.suggestion)
    }
  }, [actionData]);

  useEffect(() => {
    ingredientRefs.current[ingredients.length - 1].focus()
  }, [ingredients])


  useEffect(() => {
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
      ]
    )
    if (ingredients.length > 1) {
      const formData = new FormData(formRef.current)
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
      <div style={{maxWidth: '62rem'}}>
        {actionData?.suggestion}
        <div className="card shadow-xl card-bordered">
          <div className="card-body">
            <h1 className="text-xl text-bold">Create Your Recipe</h1>
            <hr />
            <Form
              method="post"
              ref={formRef}
              replace
            >
              <div>
                <label className="label" htmlFor="title">
                  Title
                </label>
                <input
                  ref={titleRef}
                  name="title"
                  className="input input-bordered w-full"
                  type="text"
                  aria-invalid={actionData?.errors?.title ? true : undefined}
                  aria-errormessage={
                    actionData?.errors?.title ? "title-error" : undefined
                  }
                />
                
                {actionData?.errors?.title && (
                  <div className="mt-2 text-error" id="title-error">
                    {actionData.errors.title}
                  </div>
                )}
              </div>

              <div className="mt-8">
                <fieldset>
                  <legend className="label">Ingredients:</legend>
                  <datalist id="metric-list">
                    <option value="cups"/>
                    <option value="ounces"/>
                    <option value="grams"/>
                    <option value="tablespoons"/>
                    <option value="teaspoons"/>
                    <option value="pinch"/>
                    <option value="handful"/>
                  </datalist>
                  {ingredients.map((ingr, index) => (
                    <div className="flex mb-4" key={ingr.key}>
                      <input
                        type="number"
                        aria-label="ingredient quantity"
                        placeholder="quantity"
                        name={`ingredient-quantity-${ingr.key}`}
                        ref={(elem) => (ingredientRefs.current[index] = elem)}
                        style={{maxWidth: '7rem'}}
                        className="input input-bordered"
                      />
                      <input
                        list="metric-list"
                        aria-label="ingredient metric"
                        placeholder="unit"

                        name={`ingredient-metric-${ingr.key}`}
                        className="input input-bordered mx-4"
                      />
                      <input
                        type="text"
                        aria-label="ingredient body"
                        placeholder="ingredient"
                        className="input input-bordered flex-grow"
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
                {actionData?.suggestion && <div className="text-sm mt-2 mb-2 italic">AI Suggestion: {actionData?.suggestion}</div>}
                <button type="button" onClick={() => handleAddIngredient()} className="btn btn-outline btn-primary">
                  Add ingredient
                </button>
              </div>
              <div className="mt-8" >
                <fieldset>
                  <legend className="legend">Steps: </legend>
                  
                  {steps.map((step, index) => (
                    <div className="my-4 gap-1 flex relative" key={`step-${step}`}>
                    <textarea
                      name={`step-${step}`}
                      rows={8}
                      ref={(elem) => (stepRefs.current[index] = elem)}
                      className="input input-bordered w-full"
                    />
                    <button
                    type="button"
                    className="p-1 border-none rounded-full self-start"
                    disabled={steps.length < 2}
                    onClick={() => handleRemoveStep(step)}
                  >
                    <HiX color="red" />
                  </button>
                  </div>
                  ))}
                  <button
                    onClick={handleAddStep}
                    className="btn btn-primary btn-outline"
                  >
                    Add Step
                  </button>
                </fieldset>
              </div>

              <div className="card-actions justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Recipe
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </Layout>
  )
}
