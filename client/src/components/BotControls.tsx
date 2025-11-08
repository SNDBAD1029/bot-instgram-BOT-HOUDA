import { useState } from "react";
import { Play, Square, Volume2, VolumeX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function BotControls() {
  const [botRunning, setBotRunning] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const { toast } = useToast();

  const handleStart = () => {
    setBotRunning(true);
    console.log('Starting bot');
    toast({
      title: "تم التشغيل",
      description: "البوت يعمل الآن",
    });
  };

  const handleStop = () => {
    setBotRunning(false);
    console.log('Stopping bot');
    toast({
      title: "تم الإيقاف",
      description: "تم إيقاف البوت بنجاح",
    });
  };

  const handleTtsToggle = (checked: boolean) => {
    setTtsEnabled(checked);
    console.log('TTS enabled:', checked);
    toast({
      title: checked ? "تفعيل قراءة الرسائل" : "تعطيل قراءة الرسائل",
      description: checked ? "سيتم قراءة الرسائل الجديدة صوتياً" : "تم تعطيل قراءة الرسائل",
    });
  };

  return (
    <Card data-testid="card-bot-controls">
      <CardHeader>
        <CardTitle>التحكم في البوت</CardTitle>
        <CardDescription>
          تشغيل وإيقاف البوت وإدارة الإعدادات
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button
            onClick={handleStart}
            disabled={botRunning}
            className="flex-1 gap-2"
            data-testid="button-start-bot"
          >
            <Play className="w-4 h-4" />
            تشغيل البوت
          </Button>
          <Button
            onClick={handleStop}
            disabled={!botRunning}
            variant="destructive"
            className="flex-1 gap-2"
            data-testid="button-stop-bot"
          >
            <Square className="w-4 h-4" />
            إيقاف البوت
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/30">
          <div className="flex items-center gap-3">
            {ttsEnabled ? (
              <Volume2 className="w-5 h-5 text-primary" />
            ) : (
              <VolumeX className="w-5 h-5 text-muted-foreground" />
            )}
            <div className="space-y-0.5">
              <Label htmlFor="tts-toggle" className="text-sm font-medium cursor-pointer">
                قراءة الرسائل صوتياً (TTS)
              </Label>
              <p className="text-xs text-muted-foreground">
                استخدام خاصية المتصفح لقراءة النصوص
              </p>
            </div>
          </div>
          <Switch
            id="tts-toggle"
            checked={ttsEnabled}
            onCheckedChange={handleTtsToggle}
            data-testid="switch-tts"
          />
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">حالة البوت:</span>
            <span className={`font-medium ${botRunning ? 'text-green-500' : 'text-muted-foreground'}`} data-testid="text-bot-status">
              {botRunning ? 'يعمل' : 'متوقف'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
