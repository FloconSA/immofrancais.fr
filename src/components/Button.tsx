const Button = ({ label, as, ...props }: any) => {
  const Component = as ?? "button"
  return (
    <Component className="px-4 py-2 bg-immo-blue rounded-full" {...props}>
      {label}
    </Component>
  )
}

export default Button
