import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

interface Props {
  title?: string;
  back?: string;
  right?: ReactNode;
  children: ReactNode;
  hideNav?: boolean;
}

export function AppShell({ title, back, right, children, hideNav }: Props) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {(title || back) && (
        <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border safe-top">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
            {back && (
              <Link to={back as "/"} replace className="p-2 -ml-2 rounded-lg active:bg-muted">
                <ChevronLeft className="h-6 w-6" />
              </Link>
            )}
            <h1 className="text-lg font-bold flex-1 truncate">{title}</h1>
            {right}
          </div>
        </header>
      )}
      <main className={`flex-1 max-w-lg w-full mx-auto px-4 ${hideNav ? "pb-6" : "pb-28"} pt-3`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
