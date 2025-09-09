import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Star } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface ActivityItem {
  type: "win" | "draft" | "league" | "achievement";
  message: string;
  time: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  title?: string;
  description?: string;
}

export function RecentActivity({
  activities,
  title,
  description,
}: RecentActivityProps) {
  const { t } = useTranslation('dashboard');
  const getActivityColor = (type: string) => {
    switch (type) {
      case "win":
        return "bg-green-500";
      case "draft":
        return "bg-blue-500";
      case "league":
        return "bg-purple-500";
      case "achievement":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          {title || t('recentActivity')}
        </CardTitle>
        <CardDescription>{description || t('recentActivitySubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(
                  activity.type
                )}`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
