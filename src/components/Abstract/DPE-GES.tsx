const DPE = ({ code }) => {
  return (
    <div className="flex gap-1">
      <div className="bg-DPE-A px-4 py-1 text-white font-bold rounded-l-full">{code === "A" && "A"}</div>
      <div className="bg-DPE-B px-4 py-1 text-white font-bold">{code === "B" && "B"}</div>
      <div className="bg-DPE-C px-4 py-1 text-white font-bold">{code === "C" && "C"}</div>
      <div className="bg-DPE-D px-4 py-1 text-white font-bold">{code === "D" && "D"}</div>
      <div className="bg-DPE-E px-4 py-1 text-white font-bold">{code === "E" && "E"}</div>
      <div className="bg-DPE-F px-4 py-1 text-white font-bold">{code === "F" && "F"}</div>
      <div className="bg-DPE-G px-4 py-1 text-white font-bold rounded-r-full">{code === "G" && "G"}</div>
    </div>
  )
}

const GES = ({ code }) => {
  return (
    <div className="flex gap-1">
      <div className="bg-GES-A px-4 py-1 text-white font-bold rounded-l-full">{code === "A" && "A"}</div>
      <div className="bg-GES-B px-4 py-1 text-white font-bold">{code === "B" && "B"}</div>
      <div className="bg-GES-C px-4 py-1 text-white font-bold">{code === "C" && "C"}</div>
      <div className="bg-GES-D px-4 py-1 text-white font-bold">{code === "D" && "D"}</div>
      <div className="bg-GES-E px-4 py-1 text-white font-bold">{code === "E" && "E"}</div>
      <div className="bg-GES-F px-4 py-1 text-white font-bold">{code === "F" && "F"}</div>
      <div className="bg-GES-G px-4 py-1 text-white font-bold rounded-r-full">{code === "G" && "G"}</div>
    </div>
  )
}

export { DPE, GES }