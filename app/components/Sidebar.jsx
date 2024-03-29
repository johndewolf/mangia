import { Link, Form, useLocation } from "@remix-run/react"
import { Fragment } from "react";
import { useOptionalUser } from "../utils";
import { HiLogout, HiArrowSmUp, HiArrowSmRight, HiOutlineViewBoards, HiUser, HiUsers }  from "react-icons/hi"

const Sidebar = ({children}) => {
  const { pathname } = useLocation();
  const user = useOptionalUser();
  const menuLinkClasses = "flex items-center p-2 w-full text-base text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
  return (
    <Fragment>
      <aside aria-label="Sidebar" className="bg-gray-50 py-4 px-3">
        <ul className="space-y-2">
          <li>
            <Link to="/recipes" className={pathname === '/recipes' ? menuLinkClasses + ' font-bold' : menuLinkClasses}>
              <HiOutlineViewBoards /> <span className="ml-3">Recipes</span>
            </Link>
          </li>
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
                  <HiUser /><span className="ml-3">My Profile</span>
                </Link>
              </li>
              <li>
                <Form action="/logout" method="post">
                  <button type="submit" className={menuLinkClasses}>
                    <HiLogout /><span className="ml-3">Logout</span>
                  </button>
                </Form>
              </li>
            </Fragment>
            :
            <Fragment>
              <li>
                <Form action="/auth/auth0" method="post" className={menuLinkClasses}>
                  <button className="flex items-center"><HiArrowSmRight /><span className="ml-3">Log in</span></button>
                </Form>
              </li>
              <li>
                <Form action="/auth/auth0?screen_hint=signup" method="post" className={menuLinkClasses}>
                  <button className="flex items-center"><HiArrowSmUp /><span className="ml-3">Sign Up</span></button>
                </Form>
              </li>
            </Fragment> 
          }
        </ul>
      </aside>

    </Fragment>
  )
}

export default Sidebar;
