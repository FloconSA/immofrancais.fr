import { cn } from "../lib/format"

/** Logo ImmoFrançais, dans la couleur du texte (s'adapte au mode sombre) */
const Logo = ({ className }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={cn("inline-block bg-current", className)}
    style={{
      WebkitMask: "url(/logo.svg) center / contain no-repeat",
      mask: "url(/logo.svg) center / contain no-repeat",
    }}
  />
)

export default Logo
