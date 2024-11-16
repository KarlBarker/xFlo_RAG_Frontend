"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, BarChart2, FileText, MessageSquare, Users } from "lucide-react";
import Link from "next/link";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("pb-12 w-64 border-r bg-gray-50/40", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <div className="mb-8">
            <h2 className="text-lg font-semibold tracking-tight">xFlo</h2>
          </div>
          <Button variant="secondary" className="w-full justify-start" asChild>
            <Link href="/chat/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Start a new chat
            </Link>
          </Button>
        </div>
        <div className="px-4">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Recent
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/reports">
                <BarChart2 className="mr-2 h-4 w-4" />
                July Reports
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/terms">
                <FileText className="mr-2 h-4 w-4" />
                Terms & conditions questions
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/case-study">
                <MessageSquare className="mr-2 h-4 w-4" />
                Case study research
              </Link>
            </Button>
          </div>
        </div>
        <div className="px-4">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Admin
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/users">
                <Users className="mr-2 h-4 w-4" />
                Users
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}