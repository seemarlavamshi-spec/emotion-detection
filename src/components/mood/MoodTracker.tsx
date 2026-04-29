import React, { useState, useRef, useEffect } from 'react';
import { Camera, Brain, Sparkles, Loader2, AlertCircle, RefreshCw, Smile, Frown, Zap, Moon, Utensils, Flame, Ghost, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function MoodTracker() {
  const [mode, setMode] = useState<'text' | 'face'>('text');
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ emotion: string; confidence: number; explanation: string } | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (mode === 'face' && !stream) {
      startCamera();
    } else if (mode === 'text' && stream) {
      stopCamera();
    }
  }, [mode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
  };

  const saveResult = (data: any) => {
    setResult(data);
    const history = JSON.parse(localStorage.getItem('mood_history') || '[]');
    const newEntry = {
      ...data,
      timestamp: new Date().toISOString(),
      method: mode
    };
    localStorage.setItem('mood_history', JSON.stringify([...history, newEntry]));
  };

  const analyzeText = async () => {
    if (!textInput.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      // Calling Gemini directly in frontend as per best practices
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following text for emotional content and return a JSON object with "emotion" (choose the single best descriptive word, e.g.: happy, sad, angry, depression, anxiety, tiredness, hungry, stressed, neutral, curious, surprised, fearful, disgusted), "confidence" (0-1), and "explanation".
        
        Text: "${textInput}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              emotion: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              explanation: { type: Type.STRING },
            },
            required: ["emotion", "confidence", "explanation"]
          }
        }
      });

      if (response.text) {
        saveResult(JSON.parse(response.text));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || isAnalyzing) return;
    setIsAnalyzing(true);
    
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      // Match canvas size to video aspect ratio
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            },
            {
              text: `Analyze the facial expression in this image to detect the person's emotion. 
              Be extremely specific and detect even subtle cues. Return a JSON object with "emotion" 
              (one word, lowercase, e.g.: happy, sad, angry, surprised, neutral, tired, stressed, fearful, pensive, focused, disappointed, disgusted, excited), 
              "confidence" (percentage 0-1), and an empathetic "explanation" based on facial micro-expressions.`
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              emotion: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              explanation: { type: Type.STRING },
            },
            required: ["emotion", "confidence", "explanation"]
          }
        }
      });

      if (response.text) {
        saveResult(JSON.parse(response.text));
      }
    } catch (err) {
      console.error("Vision API Error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getEmotionIcon = (emotion: string) => {
    const e = emotion.toLowerCase();
    if (e.includes('happy') || e.includes('joy') || e.includes('excited')) return <Smile size={48} />;
    if (e.includes('sad') || e.includes('depression') || e.includes('lonely') || e.includes('disappointed')) return <Frown size={48} />;
    if (e.includes('angry') || e.includes('frustrated') || e.includes('disgusted')) return <Flame size={48} />;
    if (e.includes('tired') || e.includes('sleepy') || e.includes('exhausted')) return <Moon size={48} />;
    if (e.includes('hungry')) return <Utensils size={48} />;
    if (e.includes('stressed') || e.includes('anxiety') || e.includes('fearful') || e.includes('scared')) return <Zap size={48} />;
    if (e.includes('pensive') || e.includes('focused') || e.includes('neutral')) return <Brain size={48} />;
    return <Sparkles size={48} />;
  };

  const getEmotionColors = (emotion: string) => {
    const e = emotion.toLowerCase();
    if (e.includes('happy') || e.includes('joy')) return "bg-emerald-50 text-emerald-500 border-emerald-100";
    if (e.includes('sad') || e.includes('depression')) return "bg-blue-50 text-blue-500 border-blue-100";
    if (e.includes('angry') || e.includes('frustrated')) return "bg-rose-50 text-rose-500 border-rose-100";
    if (e.includes('stressed') || e.includes('anxiety')) return "bg-amber-50 text-amber-500 border-amber-100";
    if (e.includes('tired')) return "bg-indigo-50 text-indigo-500 border-indigo-100";
    return "bg-slate-50 text-slate-500 border-slate-100";
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold text-slate-900 italic">Emotional Intelligence</h2>
          <p className="text-slate-500 mt-1">Real-time analysis of your thoughts and facial micro-expressions.</p>
        </div>
        <div className="bg-white p-1 rounded-2xl border border-slate-200 flex shadow-sm">
          <button 
            onClick={() => setMode('text')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
              mode === 'text' ? "bg-brand-primary text-white" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Thought Analysis
          </button>
          <button 
            onClick={() => setMode('face')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
              mode === 'face' ? "bg-brand-primary text-white" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Vision Scan
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Card */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col min-h-[450px]">
          {mode === 'text' ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-soft text-brand-primary rounded-xl flex items-center justify-center">
                  <Brain size={20} />
                </div>
                <h3 className="font-semibold text-lg">Journal your feelings</h3>
              </div>
              <textarea 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Write honestly about how you're doing... the AI will listen with empathy."
                className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-6 text-slate-700 outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all resize-none italic"
              />
              <button 
                onClick={analyzeText}
                disabled={!textInput.trim() || isAnalyzing}
                className="mt-6 w-full bg-brand-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:opacity-95 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                {isAnalyzing ? 'Processing Insight...' : 'Begin Text Analysis'}
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                  <Camera size={20} />
                </div>
                <h3 className="font-semibold text-lg">Face Expression Scan</h3>
              </div>
              <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden relative group">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full h-full object-cover"
                />
                {!stream && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 gap-4">
                    <Camera size={48} className="opacity-20 transition-transform group-hover:scale-110" />
                    <button 
                      onClick={startCamera}
                      className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full text-white text-sm font-bold backdrop-blur-md transition-all"
                    >
                      Initialize Vision Link
                    </button>
                  </div>
                )}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-brand-primary/40 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-4">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="font-bold tracking-widest uppercase text-[10px]">Scanning Micro-Expressions</span>
                  </div>
                )}
              </div>
              <button 
                onClick={captureAndAnalyze}
                disabled={!stream || isAnalyzing}
                className="mt-6 w-full bg-brand-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:opacity-95 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" /> : <Camera size={18} />}
                {isAnalyzing ? 'Synchronizing Neural Feedback...' : 'Capture and Scan'}
              </button>
            </div>
          )}
        </div>

        {/* Result Card */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={cn(
                  "p-8 rounded-[2rem] border shadow-xl flex-1 flex flex-col justify-center text-center relative overflow-hidden",
                  getEmotionColors(result.emotion)
                )}
              >
                <div className="absolute top-4 right-4">
                  <button 
                    onClick={() => setResult(null)}
                    className="p-2 opacity-30 hover:opacity-100 transition-opacity"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
                
                <div className="w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center mb-6 shadow-inner bg-white/50 backdrop-blur-sm">
                  {getEmotionIcon(result.emotion)}
                </div>
                
                <h3 className="text-[10px] font-mono font-bold opacity-50 uppercase tracking-[0.3em] mb-2">Analysis Result</h3>
                <h2 className="text-4xl font-serif font-bold capitalize italic leading-none mb-6">
                  {result.emotion}
                </h2>
                
                <div className="w-full bg-black/5 h-2 rounded-full mb-8 overflow-hidden relative border border-black/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${result.confidence * 100}%` }}
                    className="h-full bg-current opacity-60"
                  />
                  <div className="absolute top-0 right-0 h-full flex items-center pr-2">
                    <span className="text-[10px] font-mono font-bold uppercase opacity-40">Confidence: {Math.round(result.confidence * 100)}%</span>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute -top-3 -left-3 opacity-20"><MessageSquare size={24}/></div>
                  <p className="bg-white/40 backdrop-blur-sm p-6 rounded-2xl text-lg leading-relaxed italic border border-white/20 text-slate-700">
                    "{result.explanation}"
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                className="bg-slate-50 p-12 rounded-[2rem] border-2 border-dashed border-slate-200 flex-1 flex flex-col items-center justify-center text-center text-slate-400 group"
              >
                <Brain size={64} className="mb-4 opacity-5 transition-transform group-hover:scale-110 duration-700" />
                <p className="font-bold text-sm tracking-widest uppercase">Awaiting Input Signal</p>
                <p className="text-[10px] mt-2 max-w-[220px] opacity-60">Complete a Thought Analysis or Vision Scan to receive psychological feedback.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shrink-0 border border-rose-100">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-rose-900 text-sm tracking-tight">Safeguard Protocol</h4>
              <p className="text-[11px] text-rose-700/70 mt-1 leading-relaxed">
                Detection of high-risk signals will trigger immediate support paths. We prioritize your well-being over data.
              </p>
            </div>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}


function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
