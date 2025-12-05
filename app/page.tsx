import { ClientList } from "./client-list";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Section spacing per brand guidelines: 64px mobile (py-16), 120px desktop (py-30) */}
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-30">
        <ClientList />
      </div>
    </main>
  );
}
