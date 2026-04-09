import CustomHeader from "@/components/header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-background text-foreground font-sans">
      <CustomHeader />
      <main className="flex flex-col justify-center items-center flex-1 gap-8">
        <div className="flex flex-col justify-center items-center gap-1">
        <p className="text-lg text-muted tracking-wider">Welcome to</p>
        <h2 className="text-4xl font-semibold tracking-tight text-outline">branduv + lucielmoe</h2>
        <p className="text-lg tracking-wider">Your account, your way.</p>
        </div>
        <Link
          href="/login"
          className="mt-4 px-6 py-2 bg-outline text-background rounded-lg font-medium hover:bg-outline/90 transition-colors duration-150"
        >
          Get started
        </Link>
      </main>
    </div>
  );
}
