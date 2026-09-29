import Contact from "../components/Contact"

const ContactPage = () => (
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

export default ContactPage
