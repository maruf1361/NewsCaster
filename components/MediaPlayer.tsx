import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, FileText, RefreshCw, ExternalLink } from 'lucide-react';

interface MediaPlayerProps {
  audioUrl: string;
  script: string;
  title: string;
  sources: Array<{ title: string; uri: string }>;
  onReset: () => void;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ audioUrl, script, title, sources, onReset }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showScript, setShowScript] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
      const newTime = (val / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(val);
    }
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full animate-fade-in space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Album Art / Header */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-8 z-10 relative">
          <div className="w-32 h-32 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center text-white relative group cursor-pointer overflow-hidden">
             <div className="text-4xl relative z-10 transition-transform group-hover:scale-110">🎙️</div>
             {/* Visualizer effect in album art */}
             {isPlaying && (
               <div className="absolute inset-0 flex items-end justify-center gap-1 p-4 opacity-50">
                  <div className="w-1.5 bg-white animate-[bounce_0.8s_infinite] h-8"></div>
                  <div className="w-1.5 bg-white animate-[bounce_1.1s_infinite] h-12"></div>
                  <div className="w-1.5 bg-white animate-[bounce_0.9s_infinite] h-6"></div>
               </div>
             )}
          </div>
          <div className="text-center md:text-left flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{title}</h2>
            <p className="text-sm text-slate-400 mb-4">Generated Personal Briefing</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <button 
                onClick={() => setShowScript(!showScript)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${showScript ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-700 text-slate-400'}`}
              >
                <FileText className="w-3 h-3" />
                Script
              </button>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-xs font-mono text-slate-400 w-10 text-right">{formatTime(audioRef.current?.currentTime || 0)}</span>
            <div className="flex-1 relative h-1.5 bg-slate-700 rounded-full group cursor-pointer">
              <div 
                className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full pointer-events-none transition-all group-hover:bg-indigo-400" 
                style={{ width: `${progress}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs font-mono text-slate-400 w-10">{formatTime(duration)}</span>
          </div>

          <div className="flex justify-center items-center gap-6 mt-6">
             <button className="text-slate-500 hover:text-slate-300 transition-colors" onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 15; }}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>
             </button>
             <button 
                onClick={togglePlay}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-slate-900 shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
             >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
             </button>
             <button className="text-slate-500 hover:text-slate-300 transition-colors" onClick={() => { if(audioRef.current) audioRef.current.currentTime += 15; }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 17 5-5-5-5"/><path d="m6 17 5-5-5-5"/></svg>
             </button>
          </div>
        </div>

        {/* Sources */}
        {sources.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Sources Cited</p>
            <div className="flex flex-wrap gap-2">
              {sources.map((source, i) => (
                <a 
                  key={i} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/50 hover:bg-slate-900 border border-slate-700 rounded-lg text-[10px] text-slate-300 transition-colors"
                >
                  <span className="truncate max-w-[150px]">{source.title}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                </a>
              ))}
            </div>
          </div>
        )}

        <audio ref={audioRef} src={audioUrl} className="hidden" crossOrigin="anonymous" />
        
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {showScript && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-fade-in-down">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Transcript</h3>
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed font-serif">
             {script.split('\n').map((line, i) => (
               <p key={i} className={`mb-2 ${line.includes(':') ? 'font-sans text-xs opacity-70 mb-0 mt-3' : ''}`}>
                 {line}
               </p>
             ))}
          </div>
        </div>
      )}

      <div className="flex justify-center gap-4">
        <a 
          href={audioUrl} 
          download={`newscaster-${new Date().toISOString().slice(0,10)}.wav`}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium py-2 px-4"
        >
          <Download className="w-4 h-4" />
          Download MP3
        </a>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium py-2 px-4"
        >
          <RefreshCw className="w-4 h-4" />
          New Briefing
        </button>
      </div>
    </div>
  );
};

export default MediaPlayer;