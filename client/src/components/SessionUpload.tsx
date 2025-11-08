import { useState } from "react";
import { Upload, FileJson } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function SessionUpload() {
  const [cookieString, setCookieString] = useState("");
  const [fileName, setFileName] = useState("");
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      console.log('File selected:', file.name);
      toast({
        title: "تم اختيار الملف",
        description: `الملف: ${file.name}`,
      });
    }
  };

  const handleUploadClick = () => {
    if (!fileName) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء اختيار ملف أولاً",
      });
      return;
    }
    console.log('Uploading file:', fileName);
    toast({
      title: "جاري الرفع...",
      description: "يتم رفع ملف الجلسة",
    });
  };

  const handleImportCookies = () => {
    if (!cookieString.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء لصق سلسلة الكوكيز أولاً",
      });
      return;
    }
    console.log('Importing cookies');
    toast({
      title: "جاري الاستيراد...",
      description: "يتم استيراد الكوكيز",
    });
  };

  return (
    <Card data-testid="card-session-upload">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="w-5 h-5" />
          إعداد الجلسة
        </CardTitle>
        <CardDescription>
          قم برفع ملف appstate.json أو لصق سلسلة الكوكيز للاتصال بحساب إنستجرام
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="appstate-file" className="text-sm font-medium">
            رفع ملف الجلسة (appstate.json)
          </Label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="appstate-file"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                data-testid="input-file"
              />
              <label
                htmlFor="appstate-file"
                className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover-elevate active-elevate-2 bg-muted/30"
              >
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {fileName || 'اختر ملف JSON'}
                </span>
              </label>
            </div>
            <Button 
              onClick={handleUploadClick}
              disabled={!fileName}
              data-testid="button-upload"
            >
              رفع
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground">أو</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="cookie-string" className="text-sm font-medium">
            لصق سلسلة الكوكيز
          </Label>
          <Textarea
            id="cookie-string"
            placeholder="ig_did=...; csrftoken=...; sessionid=..."
            value={cookieString}
            onChange={(e) => setCookieString(e.target.value)}
            className="min-h-24 font-mono text-xs bg-muted/50"
            data-testid="input-cookies"
          />
          <Button 
            onClick={handleImportCookies}
            variant="secondary"
            className="w-full"
            disabled={!cookieString.trim()}
            data-testid="button-import-cookies"
          >
            استيراد الكوكيز
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
