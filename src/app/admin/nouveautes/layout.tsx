import IntelligenceSidebar from "@/components/admin/intelligence/IntelligenceSidebar";
import IntelligenceTopbar from "@/components/admin/intelligence/IntelligenceTopbar";

export default function NewsAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#080b10] text-white">
      <IntelligenceSidebar />

      <div className="lg:pl-[260px]">
        <IntelligenceTopbar />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}