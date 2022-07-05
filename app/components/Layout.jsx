import Sidebar from "./Sidebar"

const Layout = ({children}) => {
  return (
  <>
    <Sidebar />
    <main className="grow p-8">
      {children}
    </main>
  </>
  )
}

export default Layout
