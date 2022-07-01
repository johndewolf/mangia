import Sidebar from "./Sidebar"

const Layout = ({children}) => {
  return (
  <>
    <Sidebar />
    <main className="grow">
      {children}
    </main>
  </>
  )
}

export default Layout
