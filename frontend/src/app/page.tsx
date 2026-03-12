import Login from "./components/Login";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex w-full max-w-lg flex-col items-center justify-center gap-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            Welcome to ProofPay
          </h1>
          <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
            The next generation of decentralized proof-based payments on Flow.
          </p>
        </div>

        <Login />

        <div className="flex flex-col gap-2 text-sm text-zinc-500 text-center">
          <p>Powered by Flow Account Abstraction</p>
          <div className="flex gap-4 justify-center">
            <a href="#" className="hover:text-zinc-800 dark:hover:text-zinc-200">Docs</a>
            <a href="#" className="hover:text-zinc-800 dark:hover:text-zinc-200">Github</a>
          </div>
        </div>
      </main>
    </div>
  );
}
