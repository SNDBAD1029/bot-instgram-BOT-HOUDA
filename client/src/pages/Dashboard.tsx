import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import SessionUpload from "@/components/SessionUpload";
import WelcomeMessageEditor from "@/components/WelcomeMessageEditor";
import BotControls from "@/components/BotControls";
import StatsDisplay from "@/components/StatsDisplay";
import ConsoleLog from "@/components/ConsoleLog";

export default function Dashboard() {
  // todo: remove mock functionality - replace with real API data
  const [botRunning] = useState(false);
  const [stats] = useState({
    messagesReceived: 42,
    messagesSent: 38,
    threadCount: 12
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <DashboardHeader botRunning={botRunning} />
      
      <main className="container max-w-5xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        <div className="space-y-6">
          <SessionUpload />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WelcomeMessageEditor />
            <BotControls />
          </div>

          <StatsDisplay 
            messagesReceived={stats.messagesReceived}
            messagesSent={stats.messagesSent}
            threadCount={stats.threadCount}
          />

          <ConsoleLog />
        </div>
      </main>

      <footer className="border-t border-border mt-12 py-6">
        <div className="container max-w-5xl mx-auto px-4 lg:px-6 text-center text-sm text-muted-foreground">
          <p>
            ⚠️ تحذير: هذا البوت يستخدم API غير رسمي وقد يؤدي إلى تقييد حسابك على إنستجرام
          </p>
        </div>
      </footer>
    </div>
  );
}
