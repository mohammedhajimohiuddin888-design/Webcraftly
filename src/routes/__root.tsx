import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader, SiteFooter } from "../components/webcraftly/site-shell";
import { AuthProvider } from "../components/webcraftly/auth-context";
import { AuthModal } from "../components/webcraftly/auth-modal";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white px-4 py-16 text-center">
      <div className="max-w-md">
        <span className="brand-pill mb-4">404 Error</span>
        <h1 className="text-4xl font-extrabold text-[#071C55]">Page Not Found</h1>
        <p className="mt-3 text-sm text-[#667085]">
          The page or service you are looking for has been moved or does not exist.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/"
            className="rounded-full bg-[#0866D9] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            to="/services"
            className="rounded-full border border-[#0866D9]/30 bg-[#EAF5FF] px-5 py-2.5 text-xs font-bold text-[#0866D9] hover:bg-blue-100 transition-colors"
          >
            Explore Services
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white px-4 py-16 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-[#071C55]">Something Went Wrong</h1>
        <p className="mt-2 text-sm text-[#667085]">
          An unexpected error occurred while loading this view. You can reload or return to the marketplace.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-[#0866D9] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-[#071C55] hover:bg-gray-50 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "WebCraftly | Premium Digital Agency & Service Marketplace" },
      {
        name: "description",
        content:
          "Turn your ideas into powerful websites and grow your online presence with WebCraftly. Browse, compare, customize, and order digital services.",
      },
      { name: "author", content: "WebCraftly" },
      { property: "og:title", content: "WebCraftly | Digital Agency & Service Marketplace" },
      {
        property: "og:description",
        content:
          "Code. Craft. Connect. Premium website development, e-commerce, UI/UX, AI integration, and custom web applications.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-white text-[#15233D] antialiased selection:bg-[#EAF5FF] selection:text-[#0866D9]">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex min-h-screen flex-col bg-white">
          <SiteHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
        <AuthModal />
        <Toaster richColors position="top-right" closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}
