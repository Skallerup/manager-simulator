import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Calendar, Target, Zap, Users } from "lucide-react";

interface Event {
  type: string;
  title: string;
  date: string;
  description: string;
}

interface EventCardProps {
  events: Event[];
  title?: string;
}

export function EventCard({
  events,
  title = "Upcoming Events",
}: EventCardProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "draft":
        return <Target className="h-4 w-4" />;
      case "match":
        return <Zap className="h-4 w-4" />;
      case "transfer":
        return <Users className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event, index) => (
            <div
              key={index}
              className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-1">
                {getEventIcon(event.type)}
                <span className="text-sm font-semibold">{event.title}</span>
              </div>
              <div className="text-xs text-muted-foreground">{event.date}</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {event.description}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
