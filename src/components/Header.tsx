import { useEffect, useRef, useState } from "react"
import { Link, NavLink, useLocation } from "react-router"
import { Bars2Icon, XMarkIcon, PhoneIcon } from "@heroicons/react/24/outline"
import Logo from "./Logo"
import ThemeToggle from "./ThemeToggle"
import { useHeaderHidden, useScrolled } from "../lib/hooks"
import { cn } from "../lib/format"
import { PHONE_NUMBERS } from "../constants"

export const NAVIGATION = [
  { to: "/housing", label: "Biens à vendre" },
  { to: "/simulateurs", label: "Simulateurs" },
  { to: "/contact", label: "Contact" },
]

const Header = () => {
  const { pathname } = useLocation()
  const scrolled = useScrolled(24)
  const hidden = useHeaderHidden()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMenuOpen(false), [pathname])

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b bg-canvas/75 text-ink backdrop-blur-xl backdrop-saturate-150 transition-[transform,border-color] duration-500 ease-out-expo",
          // Filet visible seulement quand la page défile
          scrolled || menuOpen ? "border-line/70" : "border-transparent",
          hidden && !menuOpen && "-translate-y-[calc(100%+24px)]",
        )}
        style={{ viewTransitionName: "site-header" }}
      >
        <nav aria-label="Navigation principale" className="container-page flex h-16 items-center justify-between gap-6">
          <Link to="/" viewTransition className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight">
            <Logo className="h-6 w-6" />
            ImmoFrançais
          </Link>

          <div className="hidden items-center gap-1 text-sm md:flex">
            {NAVIGATION.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                viewTransition
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-4 py-2 transition-[opacity,background-color]",
                    isActive ? "tint opacity-100" : "opacity-70 hover:opacity-100",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link
              to="/contact"
              viewTransition
              className="btn-primary btn-sm hidden md:inline-flex"
            >
              Nous contacter
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-full md:hidden"
              aria-label="Ouvrir le menu"
            >
              <Bars2Icon className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}

const MobileMenu = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={ref} onClose={onClose} className="sheet md:hidden" aria-label="Menu">
      <div className="flex h-full flex-col bg-canvas text-ink">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" viewTransition onClick={onClose} className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight">
            <Logo className="h-6 w-6" />
            ImmoFrançais
          </Link>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full" aria-label="Fermer le menu">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="container-page stagger mt-10 flex flex-col">
          <Link to="/" viewTransition onClick={onClose} className="border-b border-line py-4 text-4xl font-semibold tracking-tight">
            Accueil
          </Link>
          {NAVIGATION.map((item) => (
            <Link key={item.to} to={item.to} viewTransition onClick={onClose} className="border-b border-line py-4 text-4xl font-semibold tracking-tight">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="container-page mt-auto grid gap-3 pb-10">
          {PHONE_NUMBERS.map((phone) => (
            <a key={phone.tel} href={`tel:${phone.tel}`} className="btn-secondary btn-lg">
              <PhoneIcon className="h-5 w-5" />
              {phone.label}
            </a>
          ))}
        </div>
      </div>
    </dialog>
  )
}

export default Header
