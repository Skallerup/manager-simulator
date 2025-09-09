import { Badge } from "./badge";
import { Button } from "./button";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  gradientFrom: string;
  gradientTo: string;
  stats?: {
    value: string | number;
    label: string;
  };
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  onBack?: () => void;
  backButtonText?: string;
}

export function PageHeader({
  title,
  subtitle,
  gradientFrom,
  gradientTo,
  stats,
  badge,
  onBack,
  backButtonText = "Back",
}: PageHeaderProps) {
  return (
    <div
      className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-lg p-6 text-white`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backButtonText}
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {subtitle && <p className="text-white/80 mt-1">{subtitle}</p>}
            {badge && (
              <div className="mt-2">
                <Badge
                  variant={badge.variant || "secondary"}
                  className="bg-white/20 text-white border-white/30"
                >
                  {badge.text}
                </Badge>
              </div>
            )}
          </div>
        </div>
        {stats && (
          <div className="text-right">
            <div className="text-2xl font-bold">{stats.value}</div>
            <div className="text-sm text-white/80">{stats.label}</div>
          </div>
        )}
      </div>
    </div>
  );
}
