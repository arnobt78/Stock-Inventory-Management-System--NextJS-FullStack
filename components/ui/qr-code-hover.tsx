"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeComponent } from "@/components/ui/qr-code";
import { QrCode } from "lucide-react";
import { useEffect, useState } from "react";

interface QRCodeHoverProps {
  data: string;
  title: string;
  size?: number;
}

export function QRCodeHover({ data, title, size = 200 }: QRCodeHoverProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="flex items-center gap-1 text-blue-600">
        <QrCode className="h-4 w-4" />
        {title}
      </div>
    );
  }

  return (
    <>
      {/* Text Link - Click to open dialog */}
      <button
        className="text-blue-600 hover:text-blue-800 underline cursor-pointer flex items-center gap-1 transition-colors"
        onClick={() => setIsDialogOpen(true)}
        aria-label={`View QR code for ${title}`}
      >
        <QrCode className="h-4 w-4" />
        {title}
      </button>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="p-6" aria-describedby="qr-dialog-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              {title}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription id="qr-dialog-description">
            Scan this QR code to view product details
          </DialogDescription>
          <div className="flex justify-center mt-4">
            <QRCodeComponent
              data={data}
              title={title}
              size={size}
              showDownload={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
