import { useEffect, useRef, useState } from "react";
import { Terminal, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
}

export default function ConsoleLog() {
  // todo: remove mock functionality - replace with real WebSocket data
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, timestamp: new Date().toLocaleTimeString('ar-SA'), message: 'تم الاتصال بالخادم بنجاح' },
    { id: 2, timestamp: new Date().toLocaleTimeString('ar-SA'), message: 'جاري تحميل الجلسة...' },
    { id: 3, timestamp: new Date().toLocaleTimeString('ar-SA'), message: 'تم تحميل الجلسة من appstate.json' },
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new logs added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleClear = () => {
    setLogs([]);
    console.log('Console cleared');
  };

  // todo: remove mock functionality - simulating new log entries
  const addMockLog = () => {
    const mockMessages = [
      'رسالة جديدة من المستخدم 123456',
      'تم إرسال رسالة الترحيب',
      'محاولة اتصال keep-alive',
      'تم جلب 5 محادثات جديدة'
    ];
    const newLog: LogEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('ar-SA'),
      message: mockMessages[Math.floor(Math.random() * mockMessages.length)]
    };
    setLogs(prev => [...prev, newLog]);
  };

  return (
    <Card data-testid="card-console">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            سجل البوت
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={addMockLog}
              className="gap-2"
              data-testid="button-add-log"
            >
              إضافة سجل تجريبي
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="gap-2"
              data-testid="button-clear-logs"
            >
              <Trash2 className="w-4 h-4" />
              مسح
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea 
          className="h-64 rounded-lg border border-border bg-black/50 p-4"
          ref={scrollRef}
        >
          <div className="space-y-1 font-mono text-sm" data-testid="console-output">
            {logs.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                لا توجد سجلات بعد...
              </div>
            ) : (
              logs.map((log) => (
                <div 
                  key={log.id}
                  className="text-cyan-400/90 hover:text-cyan-300 transition-colors"
                >
                  <span className="text-cyan-600">[{log.timestamp}]</span>{' '}
                  {log.message}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
