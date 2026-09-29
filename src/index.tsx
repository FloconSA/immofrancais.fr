import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@fontsource-variable/geist"
import "@fontsource/instrument-serif/400.css"
import "@fontsource/instrument-serif/400-italic.css"
import "./styles.css"
import App from "./App"
import { loadHouses } from "./lib/houses"

// Les annonces commencent à se charger avant même l'affichage de la page
loadHouses().catch(() => {})

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
