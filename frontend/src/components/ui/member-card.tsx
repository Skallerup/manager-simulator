import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Users, User, Crown, Star } from "lucide-react";

interface Member {
  id: string;
  user: {
    name?: string;
    email: string;
  };
  role: string;
}

interface MemberCardProps {
  members: Member[];
  title?: string;
}

export function MemberCard({
  members,
  title = "League Members",
}: MemberCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">
                  {member.user.name || member.user.email}
                </span>
              </div>
              <Badge
                variant={member.role === "ADMIN" ? "default" : "secondary"}
                className={
                  member.role === "ADMIN"
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                    : ""
                }
              >
                {member.role === "ADMIN" ? (
                  <div className="flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Admin
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Member
                  </div>
                )}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
