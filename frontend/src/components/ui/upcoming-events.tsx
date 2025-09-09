import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Badge } from "./badge";
import { Calendar } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface EventItem {
  type: "draft" | "match" | "transfer" | "deadline";
  title: string;
  date: string;
  description?: string;
}

interface UpcomingEventsProps {
  events: EventItem[];
  title?: string;
  description?: string;
}

export function UpcomingEvents({
  events,
  title,
  description,
}: UpcomingEventsProps) {
  const { t } = useTranslation('dashboard');
  const getEventBadgeVariant = (type: string) => {
    switch (type) {
      case "draft":
        return "default";
      case "match":
        return "secondary";
      case "transfer":
        return "outline";
      case "deadline":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {title || t('upcomingEvents')}
        </CardTitle>
        <CardDescription>{description || t('upcomingEventsSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-muted-foreground">{event.date}</p>
                {event.description && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {event.description}
                  </p>
                )}
              </div>
              <Badge variant={getEventBadgeVariant(event.type)}>
                {t(event.type)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
