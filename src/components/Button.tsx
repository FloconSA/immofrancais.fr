const Button = ({ label, as, ...props }: any) => {
  const Component = as ?? "button"
  return (
    <Component className="px-4 py-2 bg-immo-blue rounded-full disabled:opacity-50 disabled:cursor-not-allowed" {...props}>
      {label}
    </Component>
  )
}

export default Button
