import Link from "next/link";

type HeaderProps = {
  redirect?: string;
  text?: string
}

export default function CustomHeader({redirect = "/login", text = "login"}: HeaderProps) {
  return (
    <header className="flex h-12 w-full justify-between md:justify-start items-center font-semibold px-8 border-b border-zinc-800"><h1>branduv + lucielmoe</h1><Link href={redirect}>{text}</Link></header>
  )
}