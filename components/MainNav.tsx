'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserNav } from "./user-nav";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex items-center space-x-6", className)}
      {...props}
    >
      <Link
        href="/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-gray-900",
          pathname === "/dashboard" ? "text-gray-900" : "text-gray-500"
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/documents"
        className={cn(
          "text-sm font-medium transition-colors hover:text-gray-900",
          pathname === "/documents" ? "text-gray-900" : "text-gray-500"
        )}
      >
        Documents
      </Link>
      <Link
        href="/chat"
        className={cn(
          "text-sm font-medium transition-colors hover:text-gray-900",
          pathname === "/chat" ? "text-gray-900" : "text-gray-500"
        )}
      >
        Chat
      </Link>
      <UserNav />
    </nav>
  );
}