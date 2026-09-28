import { currency } from "../api";

const House = ({ house }: any) => {
  return (
    <a href={`/housing/${house.id}`} className="grid grid-cols-1 md:grid-cols-2 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.01] transition duration-200">
      <img src={house.thumbnails[0]} alt={house.name} loading="lazy" className="rounded-t-lg md:rounded-t-none md:!rounded-l-lg object-cover w-full h-80 md:h-[22rem]" />
      <div className="rounded-b-lg md:rounded-b-none md:!rounded-r-lg p-6 flex flex-col gap-4">
        <div className="font-md text-gray-500">{house.type} - {currency.format(house.price)}</div>
        <h2 className="font-bold text-2xl mt-2">{house.name}</h2>
        <p className="line-clamp-[8] text-gray-500 text-justify">{house.description}</p>
      </div>
    </a>
  )
}

export default House;
