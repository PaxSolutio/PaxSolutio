import type { ReactNode } from "react";

import IntelligenceShell from "@/components/admin/intelligence/IntelligenceShell";

export default function IntelligenceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <IntelligenceShell>
      {children}
    </IntelligenceShell>
  );
}