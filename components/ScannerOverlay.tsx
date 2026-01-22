
import React, { useEffect, useRef, useState } from 'react';
import { Button, Input } from './UI';

interface ScannerOverlayProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [view, setView] = useState<'camera' | 'manual'>('camera');

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      if (view !== 'camera') return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("No se pudo acceder a la cámara.");
        setView('manual');
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [view]);

  return (
    <div className="fixed inset-0 z-[1000] bg-[#0a0518] flex flex-col items-center p-8 text-white overflow-y-auto pt-24">
      <header className="absolute top-8 left-0 right-0 px-8 flex justify-between items-center z-10">
        <h2 className="text-xl font-black tracking-tighter uppercase">Validación BarriBox</h2>
        <button onClick={onClose} className="p-4 bg-white/5 rounded-full border border-white/10 active:scale-90 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </header>

      {view === 'camera' ? (
        <div className="w-full flex flex-col items-center gap-12 mt-10">
          <div className="relative w-full aspect-square max-w-sm rounded-[3rem] overflow-hidden border-4 border-[#8b5cf6] shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover grayscale opacity-60"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 h-3/4 border-2 border-dashed border-white/30 rounded-3xl"></div>
            </div>
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#8b5cf6] shadow-[0_0_15px_#8b5cf6] animate-scan"></div>
          </div>
          
          <div className="w-full space-y-4 text-center">
             <p className="text-xs font-black uppercase tracking-widest text-purple-300/40">Escanea el código del paquete</p>
             <button onClick={() => setView('manual')} className="text-[#ec4899] font-black uppercase text-[10px] tracking-[0.3em] hover:underline underline-offset-8">
               ¿No funciona? Introduce código manual
             </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-8 animate-in slide-in-from-bottom duration-500 mt-10 pb-20">
           <div className="space-y-4 text-center">
              <div className="w-20 h-20 bg-[#ec4899]/10 rounded-[2rem] border border-[#ec4899]/20 flex items-center justify-center mx-auto mb-6">
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <h3 className="text-2xl font-black">Código Manual</h3>
              <p className="text-xs text-purple-300/40 font-bold uppercase">Introduce el identificador BBX-XXXX</p>
           </div>
           
           <Input 
             placeholder="BBX-A1B2" 
             value={manualCode} 
             onChange={e => setManualCode(e.target.value.toUpperCase())}
             className="text-center text-3xl py-8 tracking-widest font-black uppercase"
             autoFocus
           />

           <div className="space-y-4">
              <Button variant="primary" fullWidth className="py-7 text-lg rounded-[2.5rem]" onClick={() => onScan(manualCode)}>
                 Verificar Identidad
              </Button>
              <Button variant="glass" fullWidth className="py-5 rounded-[2.5rem]" onClick={() => setView('camera')}>
                 Volver a la cámara
              </Button>
           </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-160px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(160px); opacity: 0; }
        }
        .animate-scan {
          animation: scan 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
