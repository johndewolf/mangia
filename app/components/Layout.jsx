import Sidebar from "./Sidebar"
import { Toast } from "flowbite-react"
import { HiCheck } from "react-icons/hi"
import PropTypes from 'prop-types'

const Layout = ({mainClasses, message, children}) => {
  return (
  <>
    <Sidebar />
    <main className={mainClasses}>
      {children}
      {/* to do: fix bug of toast not showing after dismissed and new message */}
      {message ? 
      <div className="absolute bottom-4 right-4">
        <Toast>
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
            <HiCheck className="h-5 w-5" />
          </div>
          
          <div className="ml-3 text-sm font-normal">
            {message}
          </div>
          <Toast.Toggle />
        </Toast>
      </div>
      : null} 
    </main>
  </>
  )
}

Layout.defaultProps = {
  mainClasses: "grow p-8 relative"
}

Layout.protoTypes = {
  message: PropTypes.string,
  mainClasses: PropTypes.string
}

export default Layout
