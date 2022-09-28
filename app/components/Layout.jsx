import Sidebar from "./Sidebar"
import { useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PropTypes from 'prop-types'

const Layout = ({mainClasses, message, children}) => {
  useEffect(() => {
    if (message) {
      toast(message)
    }
  },[message])
  return (
  <>
    <Sidebar />
    <main className={mainClasses}>
      {children}
      <button className="btn btn-primary" onClick={() => toast('clicked')}>Click</button>
      <ToastContainer />
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
