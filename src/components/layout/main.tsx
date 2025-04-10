import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <main className="container mx-auto h-[calc(100vh-8rem)] px-4 pt-16 sm:px-6 lg:px-8">
      {children}
    </main>
  );
}