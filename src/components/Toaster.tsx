import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/20/solid"
import { dismissToast, useToasts } from "../lib/toast"
import { cn } from "../lib/format"

const icons = {
  success: CheckCircleIcon,
  error: ExclamationTriangleIcon,
  info: InformationCircleIcon,
}

const Toaster = () => {
  const toasts = useToasts()
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const Icon = icons[t.tone]
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => dismissToast(t.id)}
            className="rise pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-left text-sm font-medium text-canvas shadow-2xl shadow-black/20"
          >
            <Icon className={cn("h-5 w-5 shrink-0", t.tone === "error" ? "text-red-400" : t.tone === "success" ? "text-emerald-400" : "opacity-70")} />
            {t.message}
          </button>
        )
      })}
    </div>
  )
}

export default Toaster
