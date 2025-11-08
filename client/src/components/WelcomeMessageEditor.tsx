import { useState } from "react";
import { MessageSquare, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function WelcomeMessageEditor() {
  const [message, setMessage] = useState("مرحبا انا اسمي 22HM\n\nلقد تم تطويري من قبل حودا\n\nشكرا لـ رسالتك سيقوم حودا بالرد عليك في اقرب وقت ممكن");
  const [enabled, setEnabled] = useState(true);
  const { toast } = useToast();

  const handleSave = () => {
    console.log('Saving message:', message);
    toast({
      title: "تم الحفظ",
      description: "تم حفظ رسالة الترحيب بنجاح",
    });
  };

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    console.log('Auto-reply enabled:', checked);
    toast({
      title: checked ? "تم التفعيل" : "تم التعطيل",
      description: checked ? "الرد الآلي مفعل الآن" : "الرد الآلي معطل الآن",
    });
  };

  return (
    <Card data-testid="card-welcome-message">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          رسالة الترحيب
        </CardTitle>
        <CardDescription>
          قم بتخصيص الرسالة التي سيتم إرسالها تلقائياً للرسائل الواردة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="welcome-message" className="text-sm font-medium">
            نص الرسالة
          </Label>
          <Textarea
            id="welcome-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-32 resize-y"
            placeholder="اكتب رسالة الترحيب هنا..."
            data-testid="input-welcome-message"
          />
        </div>

        <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/30">
          <div className="space-y-0.5">
            <Label htmlFor="auto-reply-toggle" className="text-sm font-medium cursor-pointer">
              تفعيل الرد الآلي
            </Label>
            <p className="text-xs text-muted-foreground">
              إرسال الرسالة تلقائياً عند استلام رسائل جديدة
            </p>
          </div>
          <Switch
            id="auto-reply-toggle"
            checked={enabled}
            onCheckedChange={handleToggle}
            data-testid="switch-auto-reply"
          />
        </div>

        <Button 
          onClick={handleSave}
          className="w-full gap-2"
          data-testid="button-save-message"
        >
          <Save className="w-4 h-4" />
          حفظ الرسالة
        </Button>
      </CardContent>
    </Card>
  );
}
