import { createBrowserRouter, RouterProvider } from "react-router"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import Listings from "./pages/Listings"
import ContactPage from "./pages/ContactPage"
import NotFound from "./pages/NotFound"

// Les pages les plus lourdes (fiche d'un bien, simulateurs) sont chargées à la demande
const router = createBrowserRouter([
  {
    Component: Layout,
    HydrateFallback: () => null,
    children: [
      { index: true, Component: Home },
      { path: "housing", Component: Listings },
      { path: "housing/:id", lazy: () => import("./pages/HouseDetails").then((m) => ({ Component: m.default })) },
      { path: "simulateurs", lazy: () => import("./pages/Simulation").then((m) => ({ Component: m.default })) },
      { path: "contact", Component: ContactPage },
      { path: "*", Component: NotFound },
    ],
  },
])

const App = () => <RouterProvider router={router} />

export default App
