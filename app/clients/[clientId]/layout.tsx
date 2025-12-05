import {
  ClientSidebar,
  ClientSidebarMobile,
} from "@/components/client-sidebar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
      <div className="flex gap-8">
        <ClientSidebar />
        <main className="min-w-0 flex-1">
          {/* Mobile sidebar trigger */}
          <div className="mb-6 lg:hidden">
            <ClientSidebarMobile />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
