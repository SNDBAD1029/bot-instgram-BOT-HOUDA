import { ArrowDownRight, ArrowUpRight, MessageCircle, MessagesSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsDisplayProps {
  messagesReceived?: number;
  messagesSent?: number;
  threadCount?: number;
}

export default function StatsDisplay({ 
  messagesReceived = 0, 
  messagesSent = 0,
  threadCount = 0 
}: StatsDisplayProps) {
  const stats = [
    {
      label: "رسائل واردة",
      value: messagesReceived,
      icon: ArrowDownRight,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      testId: "stat-received"
    },
    {
      label: "رسائل مُرسلة",
      value: messagesSent,
      icon: ArrowUpRight,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      testId: "stat-sent"
    },
    {
      label: "المحادثات النشطة",
      value: threadCount,
      icon: MessagesSquare,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      testId: "stat-threads"
    }
  ];

  return (
    <Card data-testid="card-stats">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          إحصائيات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label}
                className="p-4 rounded-lg border border-border bg-muted/20 hover-elevate"
                data-testid={stat.testId}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <div className={`text-3xl font-bold font-mono ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
