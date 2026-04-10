import Link from "next/link";

type HeaderProps = {
  redirect?: string;
  text?: string
  showBtn?: boolean
}

export default function PublicHeader({ redirect = "/login", text = "Login", showBtn = true }: Readonly<HeaderProps>) {
  return (
    <header className="flex min-h-14 w-full justify-between items-center px-6 border-b border-border bg-background">
      <h1 className="text-sm font-semibold tracking-tight">branduv + lucielmoe</h1>
      {showBtn && (
        <Link
          href={redirect}
          className="hidden sm:flex px-4 py-1.5 rounded-lg bg-outline text-background text-sm font-medium hover:bg-outline/90 transition-colors duration-150"
        >
          {text}
        </Link>
      )}
    </header>
  )
}
