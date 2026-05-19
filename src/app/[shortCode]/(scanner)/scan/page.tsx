'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCw, Check, Loader2, X, UploadCloud, Edit3, ArrowRight, Settings, ArrowLeft, CheckCircle2, Circle, CircleDot } from 'lucide-react';
import { eventService } from '@/lib/api';

const MOCK_EXTRACTED_DATA = {
  name: 'Mukesh Singh',
  company: 'Drista Cloud Solutions',
  designation: 'CEO',
  email: 'mukesh@drista.cloud',
  phone: '+91 9876543210'
};

export default function ScanPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  
  const [step, setStep] = useState<'permission' | 'camera' | 'uploading' | 'form'>('permission');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    designation: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  // If SAMPLE24 is entered, we'll mock the extraction to avoid hitting the actual AI while testing
  const isSample = resolvedParams.shortCode.toUpperCase() === 'SAMPLE24';

  useEffect(() => {
    async function checkCameraPermission() {
      try {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (result.state === 'granted') {
          setStep('camera');
        }
      } catch (error) {
        // Fallback for browsers that don't support querying 'camera' permission (like Safari)
        if (localStorage.getItem('camera_granted') === 'true') {
          setStep('camera');
        }
      }
    }
    checkCameraPermission();
  }, []);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const src = webcamRef.current.getScreenshot();
      if (src) {
        setImageSrc(src);
        handleUpload(src);
      }
    }
  }, [webcamRef]);

  const handleUpload = async (src: string) => {
    setStep('uploading');
    
    try {
      if (isSample) {
        // Simulate network delay and AI OCR
        await new Promise(r => setTimeout(r, 2000));
        setFormData(MOCK_EXTRACTED_DATA);
        setStep('form');
        return;
      }

      // Real API integration
      // Convert base64 to Blob
      const res = await fetch(src);
      const blob = await res.blob();
      
      const response = await eventService.scanCard(resolvedParams.shortCode, blob);
      
      if (response.success && response.data) {
        setFormData({
          name: response.data.name || '',
          company: response.data.company || '',
          designation: response.data.designation || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
        });
        setStep('form');
      } else {
        alert('Failed to extract data. Please try again or fill manually.');
        setStep('form');
      }
    } catch (error) {
      console.error('Scan Error:', error);
      alert('Error connecting to scanner API. Falling back to manual entry.');
      setStep('form');
    }
  };

  const handleRetake = () => {
    setImageSrc(null);
    setStep('camera');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isSample) {
        await new Promise(r => setTimeout(r, 1000));
      } else {
        await eventService.confirmCard(resolvedParams.shortCode, formData);
      }
      // Save locally to display in history later
      const history = JSON.parse(localStorage.getItem('visitor_history') || '[]');
      history.unshift({ ...formData, timestamp: new Date().toISOString() });
      localStorage.setItem('visitor_history', JSON.stringify(history.slice(0, 10)));
      
      router.push(`/${resolvedParams.shortCode}/success`);
    } catch (error) {
      alert('Failed to save registration');
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <AnimatePresence mode="wait">
        {step === 'permission' && (
          <motion.div
            key="permission"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 bg-white text-center relative"
          >
            <div className="w-48 h-48 bg-primary/5 rounded-full flex flex-col items-center justify-center mb-8 relative">
              <div className="w-24 h-16 bg-white border-2 border-zinc-200 rounded-t-xl absolute top-6" />
              <Camera className="w-20 h-20 text-foreground relative z-10" strokeWidth={1.5} />
            </div>
            
            <h2 className="text-2xl font-black text-foreground mb-3">We need access<br/>to your camera</h2>
            <p className="text-sm font-medium text-zinc-500 mb-10 max-w-[260px] mx-auto">
              This allows you to scan business cards and capture visitor details instantly.
            </p>
            
            <button
              onClick={() => {
                localStorage.setItem('camera_granted', 'true');
                setStep('camera');
              }}
              className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              Allow Camera <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setStep('form')}
              className="mt-6 text-sm font-bold text-zinc-500 hover:text-foreground transition-colors"
            >
              Not Now
            </button>
          </motion.div>
        )}

        {step === 'camera' && (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col relative"
          >
            <div className="bg-black flex-1 relative overflow-hidden flex items-center justify-center">
              {cameraError ? (
                <div className="text-white text-center p-6">
                  <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-bold">Camera access denied.</p>
                  <p className="text-sm opacity-70 mt-2">Please enable camera permissions to scan business cards.</p>
                  <button onClick={() => setStep('form')} className="mt-6 px-6 py-2 bg-primary rounded-xl font-bold">Skip & Enter Manually</button>
                </div>
              ) : (
                <>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "environment" }}
                    onUserMediaError={() => setCameraError(true)}
                    className="object-cover w-full h-full absolute inset-0"
                  />
                  {/* Overlay Guides */}
                  <div className="absolute inset-0 border-[40px] border-black/40" />
                  <div className="absolute inset-0 border-2 border-primary/80 m-[40px] rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-none" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-white/70 font-bold tracking-widest uppercase text-xs">Align card here</p>
                  </div>
                </>
              )}
            </div>
            {!cameraError && (
              <div className="p-6 bg-background flex flex-col items-center pb-10">
                <button
                  onClick={capture}
                  className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4"
                >
                  <div className="w-16 h-16 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center hover:scale-95 transition-transform">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </button>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Tap to Scan</p>
              </div>
            )}
          </motion.div>
        )}

        {step === 'uploading' && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col relative bg-zinc-900 overflow-hidden"
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20">
              <button onClick={handleRetake} className="w-10 h-10 flex items-center justify-center bg-black/40 rounded-full text-white backdrop-blur-md">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-bold shadow-lg shadow-primary/30 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Scanning...
              </div>
              <button className="w-10 h-10 flex items-center justify-center bg-black/40 rounded-full text-white backdrop-blur-md">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Image Area with laser */}
            <div className="flex-1 relative flex items-center justify-center p-6">
               <div className="relative w-full aspect-[4/3] max-w-sm mx-auto rounded-xl overflow-hidden shadow-2xl bg-black">
                 {imageSrc && <img src={imageSrc} className="w-full h-full object-cover brightness-75" alt="Captured Card" />}
                 
                 {/* Corner Brackets */}
                 <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                 <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                 <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                 <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />

                 {/* Scanning Laser */}
                 <motion.div 
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 w-full h-1 bg-red-500 shadow-[0_0_15px_5px_rgba(239,68,68,0.7)] z-10"
                 />
               </div>
            </div>

            {/* Bottom Sheet */}
            <motion.div 
              initial={{ y: 200 }} 
              animate={{ y: 0 }}
              className="bg-white rounded-t-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative z-20"
            >
              <h3 className="text-lg font-black text-foreground mb-4">Reading Information</h3>
              
              <div className="space-y-3 mb-6">
                {[
                  { label: 'Company Name', status: 'checked' },
                  { label: 'Person Name', status: 'checked' },
                  { label: 'Designation', status: 'empty' },
                  { label: 'Email Address', status: 'partial' },
                  { label: 'Phone Number', status: 'progress' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.status === 'checked' && <CheckCircle2 className="w-5 h-5 text-primary" strokeWidth={2.5} />}
                      {item.status === 'empty' && <Circle className="w-5 h-5 text-primary" strokeWidth={2.5} />}
                      {item.status === 'partial' && <CircleDot className="w-5 h-5 text-primary" strokeWidth={2.5} />}
                      {item.status === 'progress' && <Circle className="w-5 h-5 text-primary" strokeWidth={2.5} />}
                      <span className="text-sm font-bold text-zinc-700">{item.label}</span>
                    </div>
                    {item.status === 'progress' && <span className="text-sm font-black text-primary">95%</span>}
                    {item.status === 'checked' && <Check className="w-4 h-4 text-primary" strokeWidth={4} />}
                  </div>
                ))}
              </div>

              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: '0%' }}
                   animate={{ width: '95%' }}
                   transition={{ duration: 1.5, ease: 'easeOut' }}
                   className="h-full bg-primary rounded-full"
                 />
              </div>
            </motion.div>
          </motion.div>
        )}

        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col bg-zinc-50"
          >
            <div className="p-4 bg-white border-b border-zinc-100 flex items-center gap-3">
               <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                 <Edit3 className="w-5 h-5 text-primary" />
               </div>
               <div>
                 <h2 className="text-lg font-black text-foreground">Verify Details</h2>
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Edit if necessary</p>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-4 overflow-y-auto pb-24">
              {[
                { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
                { name: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com', required: false },
                { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 ...', required: false },
                { name: 'company', label: 'Company Name', type: 'text', placeholder: 'Acme Corp', required: false },
                { name: 'designation', label: 'Designation / Job Title', type: 'text', placeholder: 'Director', required: false },
              ].map((field) => (
                <div key={field.name} className="bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm">
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 ml-1">
                    {field.label} {field.required && '*'}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    required={field.required}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 bg-transparent text-foreground font-bold outline-none placeholder:text-zinc-300 placeholder:font-medium"
                  />
                </div>
              ))}

              {imageSrc && (
                 <button type="button" onClick={handleRetake} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-zinc-500 hover:bg-zinc-200 rounded-xl transition-colors mt-2">
                   <RefreshCw className="w-4 h-4" /> Retake Photo
                 </button>
              )}
            </form>

            <div className="p-4 bg-white border-t border-zinc-100 fixed bottom-0 left-0 right-0 max-w-md mx-auto">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-black text-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" /> Confirm & Save
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
