import Contact from "../components/Contact"
import { usePageMeta } from "../lib/hooks"

const ContactPage = () => {
  usePageMeta({
    title: "Contact",
    description: "Un projet immobilier autour de Lyon ? Contactez ImmoFrançais par téléphone, e-mail ou formulaire, au 10 rue Commandant Faurax, 69006 Lyon.",
  })

  return (
    <div className="pt-12 md:pt-16">
      <Contact
        headingLevel="h1"
        title={
          <>
            Parlons de votre <span className="serif-accent">projet.</span>
          </>
        }
      />
    </div>
  )
}

export default ContactPage
