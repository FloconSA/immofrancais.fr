import { FormEvent, ReactNode, useState } from "react"
import { ArrowUpRightIcon, CheckIcon } from "@heroicons/react/20/solid"
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline"
import Reveal from "./Reveal"
import { toast } from "../lib/toast"
import { cn } from "../lib/format"
import { ADDRESS, EMAILJS_KEY, EMAILJS_SERVICE, EMAILJS_TEMPLATE, EMAILS, PHONE_NUMBERS, SOCIALS } from "../constants"

type Props = {
  defaultMessage?: string
  title?: ReactNode
  headingLevel?: "h1" | "h2"
}

const empty = { firstName: "", lastName: "", email: "", phone: "" }

const Contact = ({ defaultMessage = "", title, headingLevel = "h2" }: Props) => {
  const [values, setValues] = useState({ ...empty, message: defaultMessage })
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")
  const Heading = headingLevel

  const update = (field: keyof typeof values) => (event: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [field]: event.target.value }))

  const complete = values.firstName && values.lastName && values.email && values.message

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!complete || status === "sending") return
    setStatus("sending")
    try {
      // Le module d'envoi n'est téléchargé qu'au moment d'envoyer un message
      const emailjs = await import("@emailjs/browser")
      await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, values, EMAILJS_KEY)
      setStatus("sent")
      setValues({ ...empty, message: defaultMessage })
      toast("Message envoyé, nous vous recontactons rapidement.", "success")
    } catch {
      setStatus("idle")
      toast("Votre message n'a pas pu être envoyé. Réessayez ou appelez-nous directement.", "error")
    }
  }

  return (
    <section id="contact" className="container-page py-24 md:py-36" aria-labelledby="contact-title">
      <div className="grid gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow">Contact</p>
          <Heading id="contact-title" className="display-2 mt-4">
            {title ?? (
              <>
                Un projet ? <span className="serif-accent">Parlons-en.</span>
              </>
            )}
          </Heading>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            Une question sur un bien, une visite à organiser : écrivez-nous ou appelez-nous directement.
          </p>

          <ul className="mt-10 grid gap-5 text-[15px]">
            {PHONE_NUMBERS.map((phone) => (
              <li key={phone.tel}>
                <a href={`tel:${phone.tel}`} className="group flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-soft text-accent-ink transition-transform duration-300 group-hover:scale-105">
                    <PhoneIcon className="h-5 w-5" />
                  </span>
                  <span className="text-lg font-medium tracking-tight group-hover:text-accent-ink">{phone.label}</span>
                </a>
              </li>
            ))}
            {EMAILS.map((email) => (
              <li key={email}>
                <a href={`mailto:${email}`} className="group flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-soft">
                    <EnvelopeIcon className="h-5 w-5" />
                  </span>
                  <span className="break-all group-hover:text-accent-ink">{email}</span>
                </a>
              </li>
            ))}
            <li className="flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-soft">
                <MapPinIcon className="h-5 w-5" />
              </span>
              <address className="not-italic text-muted">
                {ADDRESS.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </address>
            </li>
          </ul>

          <div className="mt-8 flex gap-2">
            {SOCIALS.map((social) => (
              <a key={social.name} href={social.href} target="_blank" rel="noreferrer" className="btn-outline btn-sm">
                {social.name}
                <ArrowUpRightIcon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-7">
          <form onSubmit={onSubmit} className="card grid gap-5 p-6 sm:grid-cols-2 sm:p-10">
            <Field label="Prénom" id="firstName" autoComplete="given-name" value={values.firstName} onChange={update("firstName")} required />
            <Field label="Nom" id="lastName" autoComplete="family-name" value={values.lastName} onChange={update("lastName")} required />
            <Field label="E-mail" id="email" type="email" autoComplete="email" value={values.email} onChange={update("email")} required />
            <Field label="Téléphone" hint="Facultatif" id="phone" type="tel" autoComplete="tel" value={values.phone} onChange={update("phone")} />
            <div className="sm:col-span-2">
              <label htmlFor="message" className="mb-2 block text-sm font-medium">Message</label>
              <textarea id="message" rows={6} value={values.message} onChange={update("message")} required className="input resize-y" />
            </div>
            <div className="flex flex-col-reverse items-start gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p className={cn("text-sm", status === "sent" ? "text-ink" : "text-muted")} aria-live="polite">
                {status === "sent" ? (
                  <span className="inline-flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-emerald-500" />
                    Merci ! Votre message est bien parti.
                  </span>
                ) : (
                  "Nous vous recontactons rapidement."
                )}
              </p>
              <button type="submit" disabled={!complete || status === "sending"} className="btn-primary btn-lg w-full sm:w-auto">
                {status === "sending" ? "Envoi en cours…" : "Envoyer le message"}
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  )
}

type FieldProps = {
  label: string
  id: string
  hint?: string
  value: string
  onChange: (event: { target: { value: string } }) => void
  type?: string
  autoComplete?: string
  required?: boolean
}

const Field = ({ label, id, hint, ...input }: FieldProps) => (
  <div>
    <div className="mb-2 flex items-baseline justify-between">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
    <input id={id} name={id} className="input" {...input} />
  </div>
)

export default Contact
