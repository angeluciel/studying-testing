import PublicHeader from "@/components/header";

export default function Login() {
  return (
    <div className="flex flex-col gap-2 flex-1 items-center justify-start bg-background text-foreground font-sans">
      <PublicHeader showBtn={false} />
      <main className="flex flex-col gap-2 justify-center items-center h-[calc(100dvh-64px)]">
        <h1 className="text-xl font-bold">Enter your Email</h1>
        <div className="flex flex-col items-center justify-center">
          <form className="flex flex-col items-center justify-center w-72">
            <label className="flex flex-col py-2 w-full gap-1">
              <span className="pl-1">Email
                </span>
              <input placeholder="Your email" type="email" className="py-2 px-4 rounded-lg border border-zinc-800 outline-offset-2 focus:border-zinc-600 outline-emerald-400 focus:outline-2 transition-all duration-100"/>
            </label>
            <label className="flex flex-col py-2 w-full gap-1">
              <span className="pl-1">Password
                </span>
              <input placeholder="Your Secret Password" type="password" className="py-2 px-4 rounded-lg border border-zinc-800 outline-offset-2 focus:border-zinc-600 outline-emerald-400 focus:outline-2 transition-all duration-100"/>
            </label>
          </form>
        </div>
      </main>
    </div>
  );
}
