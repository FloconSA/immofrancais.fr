const _404 = () => {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-auto flex-col justify-center px-6 py-24 sm:py-64 lg:px-8">
      <p className="text-base font-semibold leading-8 text-immo-blue">404</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Page non trouvée</h1>
      <p className="mt-6 text-base leading-7 text-gray-600">Nous sommes désolés mais cette page n'existe pas</p>
      <div className="mt-10">
        <a href="/" className="text-sm font-semibold leading-7 text-immo-blue hover:underline">
          <span aria-hidden="true">&larr;</span>Retour a l'accueil
        </a>
      </div>
    </main>
  )

}

export default _404
