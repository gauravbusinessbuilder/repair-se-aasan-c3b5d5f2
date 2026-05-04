import { Outlet, Link, createRootRoute, HeadContent, Scripts, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1" },
      { title: "RepairFlow – Mobile Shop Manager" },
      { name: "description", content: "Simple app for mobile repair shops in India: track jobs, send WhatsApp updates, generate invoices." },
      { name: "theme-color", content: "#3b1d8a" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "RepairFlow" },
      { property: "og:title", content: "RepairFlow – Mobile Shop Manager" },
      { property: "og:description", content: "Simple app for mobile repair shops in India: track jobs, send WhatsApp updates, generate invoices." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "RepairFlow – Mobile Shop Manager" },
      { name: "twitter:description", content: "Simple app for mobile repair shops in India: track jobs, send WhatsApp updates, generate invoices." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c30eb32c-0e6b-4082-a9b9-d6a7dcc0180f/id-preview-45315837--e5598e47-ac2e-42d8-a67a-aff881dc1cff.lovable.app-1777638913889.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c30eb32c-0e6b-4082-a9b9-d6a7dcc0180f/id-preview-45315837--e5598e47-ac2e-42d8-a67a-aff881dc1cff.lovable.app-1777638913889.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-512.png" },
      { rel: "icon", href: "/icon-512.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <AuthGate><Outlet /></AuthGate>;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const loggedIn = useStore((s) => s.auth.loggedIn);
  const publicPath = location.pathname === "/login" || location.pathname === "/reset";

  useEffect(() => {
    if (!loggedIn && !publicPath) navigate({ to: "/login" });
  }, [loggedIn, publicPath, navigate]);

  if (!loggedIn && !publicPath) return null;
  return <>{children}</>;
}
