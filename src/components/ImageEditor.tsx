import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  RotateCw, RotateCcw, Crop as CropIcon, 
  Check, X, RefreshCw, ZoomIn, ZoomOut,
  Sun, Contrast
} from 'lucide-react';

interface ImageEditorProps {
  imageBase64: string;
  onSave: (editedBase64: string) => void;
  onCancel: () => void;
}

export function ImageEditor({ imageBase64, onSave, onCancel }: ImageEditorProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isCropping, setIsCropping] = useState(false);

  const imageSrc = `data:image/jpeg;base64,${imageBase64}`;

  // Initialize crop when image loads
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Default crop to center 90% of image
    const crop = centerCrop(
      makeAspectCrop(
        { unit: '%', width: 90 },
        width / height,
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(crop);
  }, []);

  // Rotate image
  const handleRotate = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360);
  };

  // Reset all edits
  const handleReset = () => {
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setIsCropping(false);
  };

  // Apply edits and save
  const handleSave = async () => {
    const image = imgRef.current;
    if (!image) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate dimensions
    let { width, height } = image;
    
    // Handle rotation
    const isRotated90or270 = rotation === 90 || rotation === 270;
    if (isRotated90or270) {
      canvas.width = height;
      canvas.height = width;
    } else {
      canvas.width = width;
      canvas.height = height;
    }

    // Apply transformations
    ctx.save();
    
    // Move to center, rotate, move back
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    if (isRotated90or270) {
      ctx.translate(-height / 2, -width / 2);
    } else {
      ctx.translate(-width / 2, -height / 2);
    }
    
    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    
    // Draw image
    ctx.drawImage(image, 0, 0);
    ctx.restore();

    // If cropping, apply crop
    if (completedCrop && isCropping) {
      const croppedCanvas = document.createElement('canvas');
      const croppedCtx = croppedCanvas.getContext('2d');
      if (!croppedCtx) return;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      croppedCanvas.width = completedCrop.width;
      croppedCanvas.height = completedCrop.height;

      croppedCtx.drawImage(
        canvas,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      const base64 = croppedCanvas.toDataURL('image/jpeg', 0.9).split(',')[1];
      onSave(base64);
    } else {
      const base64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
      onSave(base64);
    }
  };

  const imageStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
    transform: `rotate(${rotation}deg)`,
    maxHeight: '50vh',
    transition: 'transform 0.3s ease',
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Image Preview */}
      <div className="relative bg-muted rounded-lg overflow-hidden flex items-center justify-center min-h-[200px]">
        {isCropping ? (
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            className="max-h-[50vh]"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Edit"
              onLoad={onImageLoad}
              style={{ ...imageStyle, maxWidth: '100%' }}
            />
          </ReactCrop>
        ) : (
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Edit"
            style={{ ...imageStyle, maxWidth: '100%' }}
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Rotation Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleRotate(-90)}
          title="Rotate Left"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleRotate(90)}
          title="Rotate Right"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button
          variant={isCropping ? 'default' : 'outline'}
          size="icon"
          onClick={() => setIsCropping(!isCropping)}
          title="Crop"
        >
          <CropIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          title="Reset"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Brightness Slider */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Sun className="h-4 w-4" />
          <span>Brightness</span>
          <span className="ml-auto text-muted-foreground">{brightness}%</span>
        </div>
        <Slider
          value={[brightness]}
          onValueChange={([v]) => setBrightness(v)}
          min={50}
          max={150}
          step={5}
        />
      </div>

      {/* Contrast Slider */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Contrast className="h-4 w-4" />
          <span>Contrast</span>
          <span className="ml-auto text-muted-foreground">{contrast}%</span>
        </div>
        <Slider
          value={[contrast]}
          onValueChange={([v]) => setContrast(v)}
          min={50}
          max={150}
          step={5}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave} className="flex-1">
          <Check className="h-4 w-4 mr-2" />
          Apply
        </Button>
      </div>
    </div>
  );
}
