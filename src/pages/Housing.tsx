import { useEffect, useState } from "react"
import House from "../components/House"
import { fetchHouses } from "../api"

const Housing = () => {
  const [houses, setHouses] = useState([])

  useEffect(() => {
    (async () => {
      setHouses(await fetchHouses())
    })()
  }, [])

  return (
    <section className="max-w-4xl mx-auto flex flex-col gap-8 items-center" id="new">
      <h2 className="text-3xl mt-8">Tous nos biens en vente</h2>
      <div className="flex flex-col gap-8">
        {houses.map((house: any) => <House key={house.id} house={house} />)}
      </div>
    </section>
  )
}

export default Housing;
