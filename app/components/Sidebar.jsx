import { Link } from "@remix-run/react"
import { Fragment } from "react";
import { useLocation } from 'react-router-dom'
import { useOptionalUser } from "../utils";
import { HiArrowSmDown, HiArrowSmUp, HiArrowSmRight, HiUser, HiUsers }  from "react-icons/hi"
const Sidebar = ({children}) => {
  const { pathname } = useLocation();
  const user = useOptionalUser();
  const menuLinkClasses = "flex items-center p-2 w-full text-base text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
  return (
    <Fragment>
      <aside className="w-64" aria-label="Sidebar">
        <div className="min-h-screen overflow-y-auto py-4 px-3 bg-gray-50 rounded dark:bg-gray-800">
          <ul className="space-y-2">
            <li>
              <Link to="/user" className={pathname === '/user' ? menuLinkClasses + ' font-bold' : menuLinkClasses}>
                <HiUsers /> <span className="ml-3">Users</span>
              </Link>
            </li>
            {
              user ?
              <Fragment>
                <li>
                  <Link to={`/user/${user.username}`} className={pathname === '/users' ? menuLinkClasses + ' font-bold' : menuLinkClasses}>
                    <HiUser /><span className="ml-3">{user.username}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/logout" >
                    <form action="/logout" method="post">
                      <button type="submit" className={menuLinkClasses}>
                        <HiArrowSmDown /><span className="ml-3">Logout</span>
                      </button>
                    </form>
                    
                  </Link>
                </li>
              </Fragment>
              :
              <Fragment>
                <li>
                  <Link to="/login" className={menuLinkClasses}>
                    <HiArrowSmRight /><span className="ml-3">Login</span>
                  </Link>
                </li>
                <li>
                  <Link to="/join" className={menuLinkClasses}>
                    <HiArrowSmUp /><span className='ml-3'>Sign up</span>
                  </Link>
                </li>
              </Fragment> 
            }
          </ul>
        </div>
      </aside>
      <main className="grow">
      {children}
      </main>
    </Fragment>
  )
}

export default Sidebar;
