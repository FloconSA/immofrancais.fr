
import { useState } from 'react';
import {
  EnvelopeIcon,
  PhoneIcon,
  HomeIcon,
} from '@heroicons/react/24/outline'
import { useFormik } from 'formik';
import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';
import { EMAILJS_KEY, EMAILJS_SERVICE, EMAILJS_TEMPLATE } from '../../constants';
import Button from '../Button';


const Contact = () => {
  const [isLoading, setLoading] = useState(false);
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      message: '',
    },
    onSubmit: async (data: any) => {
      try {
        setLoading(true);
        await emailjs.send(
          EMAILJS_SERVICE,
          EMAILJS_TEMPLATE,
          data,
          EMAILJS_KEY,
        );
        toast.success('Nous avons bien reçu votre demande', {
          theme: "colored",
        });
      } catch (error) {
        toast.error('Il semblerait qu\'une erreur soit survenue', {
          theme: "colored",
        });
      }
      formik.resetForm()
      setLoading(false);
    },
  });

  return (
    <section className="mx-auto max-w-7xl py-16 px-4 sm:py-24 sm:px-6 lg:px-8" id="contact">
      <div className="relativet">
        <h2 className="font-title text-3xl font-bold mb-4">Nous contacter</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Contact information */}
          <div className="relative overflow-hidden bg-immo-blue py-10 px-6 sm:px-10 xl:p-12 rounded-2xl shadow-lg">
            <div className="pointer-events-none absolute inset-0 sm:hidden" aria-hidden="true">
              <svg
                className="absolute inset-0 h-full w-full"
                width={343}
                height={388}
                viewBox="0 0 343 388"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M-99 461.107L608.107-246l707.103 707.107-707.103 707.103L-99 461.107z"
                  fill="url(#linear1)"
                  fillOpacity=".1"
                />
                <defs>
                  <linearGradient
                    id="linear1"
                    x1="254.553"
                    y1="107.554"
                    x2="961.66"
                    y2="814.66"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#fff" />
                    <stop offset={1} stopColor="#fff" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div
              className="pointer-events-none absolute top-0 right-0 bottom-0 hidden w-1/2 sm:block lg:hidden"
              aria-hidden="true"
            >
              <svg
                className="absolute inset-0 h-full w-full"
                width={359}
                height={339}
                viewBox="0 0 359 339"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M-161 382.107L546.107-325l707.103 707.107-707.103 707.103L-161 382.107z"
                  fill="url(#linear2)"
                  fillOpacity=".1"
                />
                <defs>
                  <linearGradient
                    id="linear2"
                    x1="192.553"
                    y1="28.553"
                    x2="899.66"
                    y2="735.66"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#fff" />
                    <stop offset={1} stopColor="#fff" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div
              className="pointer-events-none absolute top-0 right-0 bottom-0 hidden w-1/2 lg:block"
              aria-hidden="true"
            >
              <svg
                className="absolute inset-0 h-full w-full"
                width={160}
                height={678}
                viewBox="0 0 160 678"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M-161 679.107L546.107-28l707.103 707.107-707.103 707.103L-161 679.107z"
                  fill="url(#linear3)"
                  fillOpacity=".1"
                />
                <defs>
                  <linearGradient
                    id="linear3"
                    x1="192.553"
                    y1="325.553"
                    x2="899.66"
                    y2="1032.66"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#fff" />
                    <stop offset={1} stopColor="#fff" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3 className="text-lg">Informations de contact</h3>
            <dl className="mt-8 space-y-6">
              <dt>
                <span className="sr-only">Phone number</span>
              </dt>
              <dd className="flex">
                <PhoneIcon className="h-6 w-6 flex-shrink-0 " aria-hidden="true" />
                <div className="flex flex-col">
                  <a href="tel:+33642233006" className="ml-3 hover:underline">(+33) 06 64 42 04 53</a>
                </div>
              </dd>
              <dt>
                <span className="sr-only">Email</span>
              </dt>
              <dd className="flex">
                <EnvelopeIcon className="h-6 w-6 flex-shrink-0 " aria-hidden="true" />
                <a href="mailto:contact@immofrancais.fr" className="ml-3 hover:underline">contact@immofrancais.fr</a>
              </dd>
              <dt>
                <span className="sr-only">Adresse</span>
              </dt>
              <dd className="flex">
                <HomeIcon className="h-6 w-6 flex-shrink-0 " aria-hidden="true" />
                <div className="ml-3 ">
                  <div>10 rue commandant Faurax</div>
                  <div>69006 Lyon: Lyon</div>
                </div>
              </dd>
            </dl>
          </div>

          {/* Contact form */}
          <div className="py-10 px-6 sm:px-10 lg:col-span-2 xl:p-12">
            <h3 className="text-lg">Envoyez nous un message</h3>
            <form onSubmit={formik.handleSubmit} className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
              <div>
                <label htmlFor="firstName" className="block text-sm">
                  Prénom
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    autoComplete="given-name"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="block w-full rounded-md border-gray-300 py-3 px-4shadow-sm focus:ring-immo-blue"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm">
                  Nom
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    autoComplete="family-name"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="block w-full rounded-md border-gray-300 py-3 px-4shadow-sm  focus:ring-immo-blue"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="block w-full rounded-md border-gray-300 py-3 px-4shadow-sm  focus:ring-immo-blue"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <label htmlFor="phone" className="block text-sm">
                    Téléphone
                  </label>
                  <span id="phone-optional" className="text-sm text-gray-500">
                    Optional
                  </span>
                </div>
                <div className="mt-1">
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    autoComplete="tel"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="block w-full rounded-md border-gray-300 py-3 px-4shadow-sm  focus:ring-immo-blue"
                    aria-describedby="phone-optional"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="flex justify-between">
                  <label htmlFor="message" className="block text-sm">
                    Message
                  </label>
                </div>
                <div className="mt-1">
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formik.values.message}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="block w-full rounded-md border-gray-300 py-3 px-4 shadow-sm  focus:ring-immo-blue"
                  />
                </div>
              </div>
              <div className="sm:col-span-2 sm:flex sm:justify-end">
                <Button
                  type="submit"
                  // className="min-w-32 bg-immo-blue enabled:hover:bg-immo-blue-900 enabled:hover:scale-110 duration-200 text-white font-bold py-2 px-4 mt-3 rounded shadow-md flex justify-center disabled:bg-immo-blue-700 disabled:cursor-not-allowed"
                  disabled={
                    isLoading ||
                    !formik.values.firstName ||
                    !formik.values.lastName ||
                    !formik.values.email ||
                    !formik.values.enterprise ||
                    !formik.values.message
                  }
                  label="Envoyer"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact;
