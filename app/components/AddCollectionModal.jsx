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
  <Modal
    show={showModal}
    size="lg"
    popup={true}
    onClose={() => (setShowModal(false))}
  >
    <Modal.Header>
      Add Recipe to Collection
    </Modal.Header>
    <Modal.Body>

    {showNewForm ? 
      <NewCollectionForm setShowModal={setShowModal} recipeName={recipe.title} />
    : 
      <div>
        <button
          className="block mx-auto rounded border-2 border-blue-500 bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          onClick={() => setShowNewForm(true)}
        >Create New Collection</button>
  

        {collections.length > 0 &&
        <ExistingCollectionsForm collections={collections} setShowModal={setShowModal} recipeId={recipe.id} />
        }
      </div>
    }
    </Modal.Body>
  </Modal>  
)}

const ExistingCollectionsForm = ({setShowModal, collections, recipeId}) => {
  return (
    <Form
      method="post"
      onSubmit={() => setShowModal(false)}
    >
      {collections.map((collection) => {
        return (
          <div className="flex items-center gap-2 mb-2"  key={collection.id}>
          <Checkbox defaultChecked={isSelected(collection.recipes, recipeId)} id={collection.id} value={collection.id} name="collection-id" />
          <Label htmlFor={collection.id}>
            {collection.title}
          </Label>
          </div>
        )
      })}
      <input type="hidden" name="all-collections" value={collections.reduce((accum, cur) => `${cur.id},`+accum , '')} />
      <input type='hidden' name="add-recipe-to-collections" value="true" />
      <button className="w-full mt-2 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400" type="submit">Submit</button>
    </Form>

  )
}

const NewCollectionForm = ({setShowModal, recipeName}) => {
  const [fieldValue, setFieldValue] = useState(`${recipeName} collection`);
  return (
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
      <button className="w-full mt-2 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400" type="submit">Save</button>
    </Form>
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
