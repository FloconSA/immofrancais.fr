import { Link } from "react-router"
import { ArrowLeftIcon } from "@heroicons/react/20/solid"

const NotFound = ({ title = "Page introuvable", text = "Cette page n'existe pas ou a été déplacée." }: { title?: string; text?: string }) => (
  <div className="container-page flex min-h-[80svh] flex-col justify-center py-32">
    <p className="serif-accent rise text-[clamp(6rem,20vw,14rem)] leading-none text-accent-ink">404</p>
    <h1 className="display-2 rise mt-4" style={{ ["--delay" as string]: "100ms" }}>{title}</h1>
    <p className="rise mt-4 max-w-md text-lg text-muted" style={{ ["--delay" as string]: "200ms" }}>{text}</p>
    <div className="rise mt-10 flex flex-wrap gap-3" style={{ ["--delay" as string]: "300ms" }}>
      <Link to="/" viewTransition className="btn-primary btn-lg">
        <ArrowLeftIcon className="h-4 w-4" />
        Retour à l'accueil
      </Link>
      <Link to="/housing" viewTransition className="btn-secondary btn-lg">
        Voir les biens
      </Link>
    </div>
  </div>
)

export default NotFound
