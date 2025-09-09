import { Badge } from "./badge";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

export function StatusBadge({
  status,
  variant = "secondary",
  className = "",
}: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "SIGNUP":
        return {
          label: "Signup Open",
          className: "bg-white/20 text-white border-white/30",
        };
      case "DRAFT_READY":
        return {
          label: "Draft Ready",
          className: "bg-white/20 text-white border-white/30",
        };
      case "DRAFT_IN_PROGRESS":
        return {
          label: "Draft In Progress",
          className: "bg-white/20 text-white border-white/30",
        };
      case "COMPLETED":
        return {
          label: "Completed",
          className: "bg-white/20 text-white border-white/30",
        };
      default:
        return {
          label: "Unknown",
          className: "bg-white/20 text-white border-white/30",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={variant} className={`${config.className} ${className}`}>
      {config.label}
    </Badge>
  );
}
