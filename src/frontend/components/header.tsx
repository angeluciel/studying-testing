import Link from "next/link";

type HeaderProps = {
  redirect?: string;
  text?: string
  showBtn?: boolean
}

export default function PublicHeader({ redirect = "/login", text = "Login", showBtn = true }: HeaderProps) {
  return (
    <header className="flex min-h-14  w-full justify-center sm:justify-between items-center font-semibold px-8 border-b border-zinc-800">
      <h1 className="text-lg md:text-base">branduv + lucielmoe</h1>
      { showBtn &&
        (<Link href={redirect} className="hidden sm:flex px-4 py-2 rounded-sm bg-teal-400 text-background">{text}</Link>)
      }
    </header>
  )
}