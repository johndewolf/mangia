import { Checkbox, Label, Modal } from "flowbite-react"
import { Form } from "@remix-run/react"
import { useState, useEffect } from "react"
import PropTypes from 'prop-types';

const isSelected = (recipes, recipeId) => {
  const filtered = recipes.filter((recipe) => {
    return recipeId === recipe?.recipe?.id
  })

  return filtered.length > 0;
}

 const AddCollectionModal = ({showModal, setShowModal, collections, recipe}) => {
  const [showNewForm, setShowNewForm ] = useState(false)
  useEffect(() => {
    return () => {
      setShowNewForm(false)
    }
  }, [showModal])
  return (

  <div className="menu p-4 overflow-y-auto w-80 bg-base-100 text-base-content">
    {showNewForm ? 
      <NewCollectionForm setShowModal={setShowModal} recipeName={recipe.title} />
    : 
      <div>
        <h2 className="text-xl font-bold mb-4">Create New Collection</h2>
        <button
          className="btn btn-primary btn-outline mb-2"
          onClick={() => setShowNewForm(true)}
        >Create</button>
  
        <div className="divider">OR</div>
        {collections.length > 0 &&
        <ExistingCollectionsForm collections={collections} setShowModal={setShowModal} recipeId={recipe.id} />
        }
        
      </div>
    }

  </div>  
)}

const ExistingCollectionsForm = ({setShowModal, collections, recipeId}) => {
  return (
    <>
    <h2 className="text-xl font-bold mb-4">Edit Existing Collections</h2>
    <Form
      method="post"
      onSubmit={() => setShowModal(false)}
    >
      {collections.map((collection) => {
        return (
          
          <div className="flex items-center gap-2 mb-2"  key={collection.id}>
            {console.log(collection)}
            <div className="form-control">
              <label className="label cursor-pointer gap-2" htmlFor={collection.id}> 
                <input type="checkbox" defaultChecked={isSelected(collection.recipes, recipeId)} id={collection.id} value={collection.id} name="collection-id" className="checkbox" />
                <span className="label-text">{collection.title}</span>
              </label>
            </div>
          </div>
        )
      })}
      <input type="hidden" name="all-collections" value={collections.reduce((accum, cur) => `${cur.id},`+accum , '')} />
      <input type='hidden' name="add-recipe-to-collections" value="true" />
      <button className="btn btn-primary mt-2" type="submit">Update</button>
    </Form>
    </>

  )
}

const NewCollectionForm = ({setShowModal, recipeName}) => {
  const [fieldValue, setFieldValue] = useState(`${recipeName} collection`);
  return (
    <>
    <Form
      method="post"
      onSubmit={() => setShowModal(false)}
    >
      <label className="flex w-full flex-col gap-1">
        <span>Give your Collection a name</span>
        <input
          value={fieldValue}
          onChange={(e)=> {setFieldValue(e.target.value)}}
          name="collection-name"
          type='text'
          className="flex-1 rounded-md border-2 border-gray-200 px-2"
        />
      </label>
      <button className="btn btn-primary mt-4" type="submit">Save</button>
    </Form>
    </>
  )
}

const recipePropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired    
});

AddCollectionModal.defaultProps = {
  collections: []
}

AddCollectionModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  setShowModal: PropTypes.func.isRequired,
  collections: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    recipes: PropTypes.arrayOf(PropTypes.shape({recipe: recipePropType})),
    title: PropTypes.string.isRequired
  })),
  recipe: recipePropType.isRequired
}


export default AddCollectionModal
