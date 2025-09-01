"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Download, QrCode } from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface QRCodeProps {
  data: string;
  title?: string;
  size?: number;
  className?: string;
  showDownload?: boolean;
}

export function QRCodeComponent({
  data,
  title = "QR Code",
  size = 200,
  className,
  showDownload = true,
}: QRCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setIsLoading(true);
        const url = await QRCode.toDataURL(data, {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error("Error generating QR code:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (data && isMounted) {
      generateQR();
    }
  }, [data, size, isMounted]);

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a");
      link.href = qrCodeUrl;
      link.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Don't render QR code until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <Card className={cn("w-fit", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center" style={{ width: size, height: size }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-fit", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col items-center gap-3">
          {isLoading ? (
            <div className="flex items-center justify-center" style={{ width: size, height: size }}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Image
              src={qrCodeUrl}
              alt="QR Code"
              width={size}
              height={size}
              className="border rounded-lg"
            />
          )}
          {showDownload && qrCodeUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
