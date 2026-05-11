import { Link, useLocation } from "@tanstack/react-router";
import { Home, Plus, MessageSquare, BarChart3, Settings } from "lucide-react";

type Item = { to: string; icon: typeof Home; label: string; primary?: boolean };
const items: Item[] = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/templates", icon: MessageSquare, label: "Msgs" },
  { to: "/add", icon: Plus, label: "Add", primary: true },
  { to: "/analytics", icon: BarChart3, label: "Stats" },
  { to: "/settings", icon: Settings, label: "Setup" },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border safe-bottom">
      <ul className="flex items-stretch justify-around max-w-lg mx-auto px-2 pt-2">
        {items.map(({ to, icon: Icon, label, primary }) => {
          const active = pathname === to;
          if (primary) {
            return (
              <li key={to} className="flex items-center -mt-6">
                <Link
                  to={to as "/"}
                  replace
                  className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center active:scale-95 transition"
                  aria-label={label}
                >
                  <Icon className="h-7 w-7" strokeWidth={2.5} />
                </Link>
              </li>
            );
          }
          return (
            <li key={to} className="flex-1">
              <Link
                to={to as "/"}
                replace
                className={`flex flex-col items-center gap-1 py-2 text-xs font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
