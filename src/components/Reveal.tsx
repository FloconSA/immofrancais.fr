import { CSSProperties, ElementType, ReactNode, useRef } from "react"
import { useInView } from "../lib/hooks"
import { cn } from "../lib/format"

type Props = {
  as?: ElementType
  delay?: number
  className?: string
  children: ReactNode
  id?: string
}

/** Fait apparaître son contenu en douceur quand il entre à l'écran */
const Reveal = ({ as: Tag = "div", delay = 0, className, children, id }: Props) => {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref)
  return (
    <Tag ref={ref} id={id} className={cn("reveal", inView && "is-in", className)} style={{ "--delay": `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  )
}

export default Reveal

/** Découpe un texte en mots qui montent un à un au chargement */
export const RisingWords = ({ text, delay = 0, step = 70 }: { text: string; delay?: number; step?: number }) => (
  <>
    {text.split(" ").map((word, i) => (
      <span key={i}>
        <span className="word-mask">
          <span style={{ "--delay": `${delay + i * step}ms` } as CSSProperties}>{word}</span>
        </span>{" "}
      </span>
    ))}
  </>
)
