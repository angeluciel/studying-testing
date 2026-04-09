import PublicHeader from "@/components/header";
import Link from "next/link";

export default function Register() {
  return (
    <div className="flex flex-col flex-1 bg-background text-foreground font-sans">
      <PublicHeader redirect="/login" text="Sign in" />
      <main className="flex flex-col justify-center items-center flex-1 px-4">
        <div className="w-full max-w-md flex flex-col gap-6 border border-border bg-surface rounded-xl px-12 py-10">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Create an account</h1>
            <p className="text-lg text-muted">Fill in the details below to get started</p>
          </div>
          <form className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className=" font-medium">Name</span>
              <input
                placeholder="Your name"
                type="text"
                className="py-2 px-3 rounded-lg border border-border-input bg-background text-foreground placeholder:text-muted  focus:border-outline focus:outline-none transition-colors duration-150"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className=" font-medium">Email</span>
              <input
                placeholder="you@example.com"
                type="email"
                className="py-2 px-3 rounded-lg border border-border-input bg-background text-foreground placeholder:text-muted  focus:border-outline focus:outline-none transition-colors duration-150"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className=" font-medium">Password</span>
              <input
                placeholder="••••••••"
                type="password"
                className="py-2 px-3 rounded-lg border border-border-input bg-background text-foreground placeholder:text-muted  focus:border-outline focus:outline-none transition-colors duration-150"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className=" font-medium">Confirm Password</span>
              <input
                placeholder="••••••••"
                type="password"
                className="py-2 px-3 rounded-lg border border-border-input bg-background text-foreground placeholder:text-muted  focus:border-outline focus:outline-none transition-colors duration-150"
              />
            </label>
            <button
              type="submit"
              className="w-full h-10 rounded-lg bg-outline text-background font-medium  cursor-pointer hover:bg-outline/90 transition-colors duration-150 mt-2"
            >
              Create Account
            </button>
          </form>
          <p className="text-center  text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-outline font-medium hover:text-outline/80 transition-colors duration-150">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
