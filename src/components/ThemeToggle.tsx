import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { setTheme, useTheme } from "../lib/theme"
import { cn } from "../lib/format"

const ThemeToggle = ({ className }: { className?: string }) => {
  const theme = useTheme()
  const next = theme === "dark" ? "light" : "dark"
  return (
    <button
      type="button"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setTheme(next, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
      }}
      className={cn("relative grid h-9 w-9 place-items-center rounded-full transition-colors tint-hover", className)}
      aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
      title={theme === "dark" ? "Mode clair" : "Mode sombre"}
    >
      <SunIcon className={cn("absolute h-5 w-5 transition-all duration-500 ease-out-expo", theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0")} />
      <MoonIcon className={cn("absolute h-5 w-5 transition-all duration-500 ease-out-expo", theme === "dark" ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100")} />
    </button>
  )
}

export default ThemeToggle
