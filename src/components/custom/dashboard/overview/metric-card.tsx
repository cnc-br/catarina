import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  detail?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export default function MetricCard({
  label,
  value,
  icon: Icon,
  detail,
  children,
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "gap-0 py-0 transition-shadow duration-200 hover:shadow-md",
        className,
      )}
    >
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
              {value}
            </p>
          </div>
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <Icon className="h-4 w-4" />
          </span>
        </div>

        {detail ? (
          <div className="text-sm text-muted-foreground">{detail}</div>
        ) : null}

        {children}
      </CardContent>
    </Card>
  );
}
