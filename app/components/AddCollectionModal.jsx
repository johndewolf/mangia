import { Modal } from "flowbite-react"
import { Form } from "@remix-run/react"

 const AddCollectionModal = ({showModal, setShowModal, collections}) => (
  <Modal
    show={showModal}
    size="lg"
    popup={true}
    onClose={() => (setShowModal(false))}
  >
    <Modal.Header>
      Add to Collection
    </Modal.Header>
    <Modal.Body>

      <h3 className="text-lg mb-4">Save to new collection</h3>
      <Form
        method="post"
        className="border-b border-solid border-gray-200 mb-4 pb-4"
        onSubmit={() => setShowModal(false)}
      >
        <label className="divide-y flex w-full flex-col gap-1">
          <span>Collection Name: </span>
          <input
            name="collection-name"
            className="flex-1 rounded-md border-2 border-gray-200 px-3 text-lg leading-loose"
          />
        </label>
        <button className="w-full mt-2 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400" type="submit">Save</button>
      </Form>

      <div>
        Form will go here
        {collections.length > 0 &&
        <p>collections will go here</p>
        }
      </div>

    </Modal.Body>
  </Modal>  
)

export default AddCollectionModal
