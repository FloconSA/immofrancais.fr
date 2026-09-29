import { useEffect } from "react"
import { Outlet, ScrollRestoration } from "react-router"
import Header from "./Header"
import Footer from "./Footer"
import Toaster from "./Toaster"

const Layout = () => {
  // Quand le navigateur n'a plus rien à faire, il prépare les autres pages en avance
  useEffect(() => {
    const prefetch = () => {
      import("../pages/HouseDetails")
      import("../pages/Simulation")
    }
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500))
    idle(prefetch)
  }, [])

  return (
    <>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-canvas">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" className="min-h-[100svh]">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
      <ScrollRestoration />
    </>
  )
}

export default Layout
