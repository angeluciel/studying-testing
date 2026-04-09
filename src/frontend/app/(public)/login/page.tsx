"use client"
import PublicHeader from "@/components/header";
import Link from "next/link";
import { useState } from "react";

export default function Login() {
  const [step, setStep] = useState<"email"|"name">("email");

  

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground font-sans">
      <PublicHeader showBtn={false} />
      <main className="flex flex-col justify-center items-center flex-1 px-4">
        <div className="w-full max-w-md flex flex-col gap-6 border border-border bg-surface rounded-xl px-12 py-10">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Sign in</h1>
            <p className=" text-muted text-lg">Enter your credentials to continue</p>
          </div>
          <form className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-medium">Email</span>
              <input
                placeholder="you@example.com"
                type="email"
                className="py-3 px-3 rounded-lg border border-border-input bg-background text-foreground placeholder:text-muted transition-colors duration-150"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium">Password</span>
                <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors duration-150 pl-2 rounded-xs">
                  Forgot password?
                </Link>
              </div>
              <input
                placeholder="Your Secret Password"
                type="password"
                className="py-3 px-3 rounded-lg border border-border-input bg-background text-foreground placeholder:text-muted transition-colors duration-150"
              />
            </label>
            <button
              type="submit"
              className="w-full h-10 rounded-lg bg-outline text-background font-medium cursor-pointer hover:bg-outline/90 transition-colors duration-150 mt-2"
            >
              Continue
            </button>
          </form>
          <p className="text-center text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-outline font-medium hover:text-outline/80 transition-colors duration-150 rounded-xs">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
