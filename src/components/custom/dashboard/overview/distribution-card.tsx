import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatNumber, formatPercent } from "./system-overview";

type DistributionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function DistributionCard({
  title,
  description,
  children,
  className,
}: DistributionCardProps) {
  return (
    <Card className={cn("gap-4", className)}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? (
          <CardDescription>{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

export type DistributionSegment = {
  label: string;
  value: number;
  percent: number;
  className: string;
};

type StackedDistributionBarProps = {
  segments: DistributionSegment[];
  ariaLabel: string;
};

export function StackedDistributionBar({
  segments,
  ariaLabel,
}: StackedDistributionBarProps) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted"
    >
      {segments.map((segment) => (
        <div
          key={segment.label}
          className={cn("h-full", segment.className)}
          style={{ width: `${segment.percent}%` }}
        />
      ))}
    </div>
  );
}

type DistributionLegendProps = {
  segments: DistributionSegment[];
};

export function DistributionLegend({ segments }: DistributionLegendProps) {
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      {segments.map((segment) => (
        <div key={segment.label} className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={cn("h-2 w-2 shrink-0 rounded-full", segment.className)}
              aria-hidden="true"
            />
            <span className="truncate text-muted-foreground">
              {segment.label}
            </span>
          </div>
          <p className="font-medium tabular-nums">
            {formatNumber(segment.value)}{" "}
            <span className="font-normal text-muted-foreground">
              ({formatPercent(segment.percent)})
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}

export type DistributionRow = {
  label: string;
  value: number;
  percent: number;
  dotClassName?: string;
  muted?: boolean;
};

type DistributionRowsProps = {
  rows: DistributionRow[];
};

export function DistributionRows({ rows }: DistributionRowsProps) {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label} className="space-y-1">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span
              className={cn(
                "flex min-w-0 items-center gap-2",
                row.muted && "text-muted-foreground",
              )}
            >
              {row.dotClassName ? (
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    row.dotClassName,
                  )}
                  aria-hidden="true"
                />
              ) : null}
              <span className="truncate">{row.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              <strong
                className={cn(
                  "font-medium text-foreground",
                  row.muted && "text-muted-foreground",
                )}
              >
                {formatNumber(row.value)}
              </strong>{" "}
              · {formatPercent(row.percent)}
            </span>
          </div>
          <Progress
            value={row.percent}
            aria-label={`${row.label}: ${formatNumber(row.value)}`}
          />
        </div>
      ))}
    </div>
  );
}
