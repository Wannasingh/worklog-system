"use client";
import ReactCrop, { Crop } from "react-image-crop";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ImageCropDialogProps {
  tempImage: string;
  crop: Crop;
  setCrop: (crop: Crop) => void;
  onCancel: () => void;
  onSave: () => void;
  imgRef: React.MutableRefObject<HTMLImageElement | null>;
}

export function ImageCropDialog({
  tempImage,
  crop,
  setCrop,
  onCancel,
  onSave,
  imgRef,
}: ImageCropDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">ปรับขนาดรูปโปรไฟล์</h3>
        </div>
        <div className="p-4">
          <div className="max-h-[60vh] overflow-hidden">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              aspect={1}
              className="max-w-full mx-auto rounded-md overflow-hidden"
            >
              <Image
                ref={imgRef}
                src={tempImage}
                alt="Crop preview"
                width={400}
                height={400}
                className="max-w-full"
                unoptimized
              />
            </ReactCrop>
          </div>
        </div>
        <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button onClick={onSave}>บันทึก</Button>
        </div>
      </div>
    </div>
  );
}