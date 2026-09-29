import type { ReactNode } from "react"
import { Link } from "react-router"
import { ArrowUpRightIcon } from "@heroicons/react/20/solid"
import Logo from "./Logo"
import { NAVIGATION } from "./Header"
import { ADDRESS, EMAILS, PHONE_NUMBERS, SOCIALS } from "../constants"

const Footer = () => (
  <footer className="relative overflow-hidden border-t border-line">
    <div className="container-page pb-10 pt-20">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link to="/" viewTransition className="inline-flex items-center gap-2.5 text-[17px] font-semibold tracking-tight">
            <Logo className="h-6 w-6" />
            ImmoFrançais
          </Link>
          <p className="mt-6 max-w-sm text-2xl font-medium leading-tight tracking-tight">
            L'immobilier, <span className="serif-accent text-[1.1em]">en toute clarté.</span>
          </p>
          <p className="mt-3 text-muted">Réseau immobilier 100 % digital, basé à Lyon.</p>
        </div>

        <FooterColumn title="Explorer" className="md:col-span-2">
          <Link to="/" viewTransition className="hover:text-ink">Accueil</Link>
          {NAVIGATION.map((item) => (
            <Link key={item.to} to={item.to} viewTransition className="hover:text-ink">
              {item.label}
            </Link>
          ))}
        </FooterColumn>

        <FooterColumn title="Nous joindre" className="md:col-span-3">
          {PHONE_NUMBERS.map((phone) => (
            <a key={phone.tel} href={`tel:${phone.tel}`} className="hover:text-ink">{phone.label}</a>
          ))}
          {EMAILS.map((email) => (
            <a key={email} href={`mailto:${email}`} className="break-all hover:text-ink">{email}</a>
          ))}
          <address className="not-italic">{ADDRESS.join(", ")}</address>
        </FooterColumn>

        <FooterColumn title="Suivre" className="md:col-span-2">
          {SOCIALS.map((social) => (
            <a key={social.name} href={social.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-ink">
              {social.name}
              <ArrowUpRightIcon className="h-4 w-4" />
            </a>
          ))}
        </FooterColumn>
      </div>

      <div className="mt-16 flex flex-col gap-2 text-sm text-muted sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} ImmoFrançais. Tous droits réservés.</p>
        <p>Estimations des simulateurs données à titre indicatif.</p>
      </div>
    </div>

    {/* Grand nom en filigrane, toujours exactement à la largeur de la page */}
    <div aria-hidden="true" className="container-page select-none">
      <svg viewBox="0 0 1000 150" className="-mb-[3%] block w-full">
        <defs>
          <linearGradient id="wordmark-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "rgb(var(--ink))", stopOpacity: 0.13 }} />
            <stop offset="0.9" style={{ stopColor: "rgb(var(--ink))", stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <text
          x="0"
          y="136"
          textLength="1000"
          lengthAdjust="spacingAndGlyphs"
          fill="url(#wordmark-fade)"
          className="font-semibold"
          style={{ fontSize: 176, letterSpacing: "-0.06em" }}
        >
          ImmoFrançais
        </text>
      </svg>
    </div>
  </footer>
)

const FooterColumn = ({ title, className, children }: { title: string; className?: string; children: ReactNode }) => (
  <div className={className}>
    <p className="text-sm font-medium text-ink">{title}</p>
    <div className="mt-4 flex flex-col gap-2.5 text-[15px] text-muted">{children}</div>
  </div>
)

export default Footer
