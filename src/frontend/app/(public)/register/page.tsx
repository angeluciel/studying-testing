import PublicHeader from "@/components/header";

export default function Register() {
  return (
    <div className="flex flex-col gap-2 flex-1 items-center justify-start bg-background text-foreground font-sans">
      <PublicHeader />
      <main className="flex flex-col gap-2 justify-center items-center h-[calc(100dvh-64px)]">
        <h1>Register</h1>
        <div className="rounded-lg flex flex-col items-center justify-center"></div>
      </main>
    </div>
  );
}
