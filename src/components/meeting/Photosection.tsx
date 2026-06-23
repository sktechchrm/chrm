import { useState, useRef } from 'react';
import { FaImage, FaTimes, FaCalendar, FaPlus } from 'react-icons/fa';
import { MeetingMinutes } from './MeetingMinutesTypes';

interface Props {
  minutes: MeetingMinutes;
  setMinutes: (data: MeetingMinutes) => void;
}

export default function PhotoSection({ minutes, setMinutes }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const REPORT_WIDTH = 1200;
  const REPORT_HEIGHT = 800;

  // Handle the meetingImage as an array to support multiple photos
  const currentImages = Array.isArray(minutes.meetingImage) 
    ? minutes.meetingImage 
    : (minutes.meetingImage ? [minutes.meetingImage] : []);

  const processAndAddImage = (file: File) => {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d', { alpha: false });
          if (!ctx) return;

          canvas.width = REPORT_WIDTH;
          canvas.height = REPORT_HEIGHT;

          // 1. Smart Crop & Scale (Cover logic)
          const scale = Math.max(REPORT_WIDTH / img.width, REPORT_HEIGHT / img.height);
          const x = (REPORT_WIDTH / 2) - (img.width / 2) * scale;
          const y = (REPORT_HEIGHT / 2) - (img.height / 2) * scale;
          
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, REPORT_WIDTH, REPORT_HEIGHT);
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

          // 2. Generate Timestamp String
          // Format: DD/MM/YYYY HH:mm
          const datePart = minutes.meetingDate || new Date().toISOString().split('T')[0];
          const timePart = minutes.startTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          const displayTimestamp = `${datePart.split('-').reverse().join('/')} ${timePart}`;

          // 3. Styling the Overlay (Matching Photo #1's Classic Orange Style)
          ctx.save();
          
          // Use a Monospace font to mimic digital camera displays
          ctx.font = 'bold 32px "Courier New", Courier, monospace';
          ctx.textAlign = 'right';
          
          // Add a dark stroke/outline for readability on light backgrounds
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 4;
          ctx.lineWidth = 4;
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.strokeText(displayTimestamp, REPORT_WIDTH - 40, REPORT_HEIGHT - 40);
          
          // Classic "Digital Camera Orange" Fill
          ctx.shadowBlur = 0; 
          ctx.fillStyle = '#ff9800'; 
          ctx.fillText(displayTimestamp, REPORT_WIDTH - 40, REPORT_HEIGHT - 40);
          
          ctx.restore();

          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMultipleUploads = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newProcessedImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const dataUrl = await processAndAddImage(files[i]);
      newProcessedImages.push(dataUrl);
    }

    setMinutes({ 
      ...minutes, 
      meetingImage: [...currentImages, ...newProcessedImages] as unknown as string 
    });
    
    setIsProcessing(false);
    e.target.value = ''; // Reset input
  };

  const removeImage = (index: number) => {
    const updatedImages = currentImages.filter((_, i) => i !== index);
    setMinutes({ ...minutes, meetingImage: updatedImages[0] ?? "" });
  };

  return (
    <div className="w-full">
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">

            {/* Control Panel */}
            <div className="sm:col-span-1 flex flex-row sm:flex-col gap-3">

              {/* Metadata info */}
              <div className="flex-1 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-[11px] font-black text-slate-400 uppercase flex items-center gap-2 mb-2">
                  <FaCalendar aria-hidden="true" /> তারিখ ও সময়
                </label>
                <p className="text-sm font-bold text-slate-700">{minutes.meetingDate || '—'}</p>
                <p className="text-xs text-slate-500 font-medium">{minutes.startTime || '—'}</p>
              </div>

              {/* Upload area */}
              <input
                id="multi-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultipleUploads}
                className="hidden"
              />
              <label
                htmlFor="multi-upload"
                className="flex-1 flex flex-col items-center justify-center min-h-[100px] sm:min-h-[140px] border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group"
              >
                <div className="p-3 bg-white shadow-md rounded-full mb-2 group-hover:scale-110 transition-transform">
                  <FaPlus className="text-indigo-600" />
                </div>
                <span className="text-xs font-bold text-slate-600">ফটো যোগ করুন</span>
                <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold">একাধিক নির্বাচন</span>
                {currentImages.length > 0 && (
                  <span className="mt-1 text-[10px] font-bold text-indigo-500">{currentImages.length} টি ফটো</span>
                )}
              </label>
            </div>

            {/* Gallery */}
            <div className="sm:col-span-3">
              {currentImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                  {currentImages.map((img, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                      <img src={img} alt={`Photo ${index + 1}`} className="w-full aspect-[3/2] object-cover" />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => removeImage(index)}
                          className="p-3 bg-white text-rose-600 rounded-full shadow-xl hover:bg-rose-600 hover:text-white transition-all"
                        >
                          <FaTimes size={16} />
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-white font-black">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="w-full aspect-[3/2] bg-indigo-50 rounded-xl border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center animate-pulse">
                      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-[10px] font-black text-indigo-400 uppercase">প্রক্রিয়াকরণ...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full min-h-[220px] sm:min-h-[350px] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
                  <FaImage size={36} className="opacity-20 mb-3" />
                  <p className="text-sm font-bold text-slate-400">কোনো ফটো নেই</p>
                  <p className="text-xs text-slate-300 mt-1">বাম দিক থেকে ফটো যোগ করুন</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}