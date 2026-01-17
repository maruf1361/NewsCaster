import React, { useState } from 'react';
import { Sparkles, Radio, Loader2, Info, Headphones } from 'lucide-react';
import PreferencesInput from './components/PreferencesInput';
import MediaPlayer from './components/MediaPlayer';
import { searchAndScriptPodcast, generateMultiSpeakerPodcast } from './services/geminiService';
import { PodcastConfig, GeneratedPodcast } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<PodcastConfig>({
    interests: [],
    publications: [], // Now an array
    duration: 'Short',
    timeframe: 'Last 24 Hours', // Default timeframe
    hostPairId: 'morning-show'
  });
  
  const [status, setStatus] = useState<'idle' | 'searching' | 'scripting' | 'recording' | 'complete' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [podcastData, setPodcastData] = useState<GeneratedPodcast | null>(null);

  const handleGenerate = async () => {
    if (config.interests.length === 0) {
      setErrorMessage("Please select at least one topic of interest.");
      setStatus('error');
      return;
    }

    setStatus('searching');
    setErrorMessage('');
    setPodcastData(null);

    try {
      // Step 1: Search & Script
      const { script, sources } = await searchAndScriptPodcast(config);
      
      setStatus('recording');

      // Step 2: Multi-Speaker TTS
      const { audioBlob } = await generateMultiSpeakerPodcast(script, config.hostPairId);
      const audioUrl = URL.createObjectURL(audioBlob);

      setPodcastData({
        id: Date.now().toString(),
        script,
        audioUrl,
        createdAt: Date.now(),
        title: `Daily Briefing: ${config.interests.join(', ')}`,
        sources
      });
      setStatus('complete');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred.");
    }
  };

  const reset = () => {
    setStatus('idle');
    setPodcastData(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 relative">
      <header className="w-full max-w-3xl mb-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-900/20">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              NewsCaster AI
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">YOUR AI NEWSROOM</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Gemini 3 Flash & 2.5 TTS</span>
        </div>
      </header>

      <main className="w-full max-w-3xl space-y-6 z-10 relative">
        
        {status === 'complete' && podcastData ? (
          <MediaPlayer 
            audioUrl={podcastData.audioUrl}
            script={podcastData.script}
            title={podcastData.title}
            sources={podcastData.sources}
            onReset={reset}
          />
        ) : (
          <div className="space-y-6 bg-slate-900/50 p-1 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-sm">
            <div className="bg-slate-900/80 p-6 md:p-8 rounded-[22px] space-y-8">
              
              <div className="text-center space-y-2 mb-8">
                 <h2 className="text-xl font-semibold text-white">Create Your Daily Podcast</h2>
                 <p className="text-sm text-slate-400">Select topics and let our AI hosts curate a personalized show for you.</p>
              </div>

              <PreferencesInput 
                config={config} 
                setConfig={setConfig} 
                disabled={status !== 'idle' && status !== 'error'}
              />
              
              <div className="h-px bg-slate-800 w-full" />
              
              {status === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
                  <Info className="w-5 h-5 shrink-0" />
                  {errorMessage || "Something went wrong. Please try again."}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={status !== 'idle' && status !== 'error'}
                className={`
                  w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all
                  ${status !== 'idle' && status !== 'error'
                    ? 'bg-slate-800 text-slate-400 cursor-wait' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transform hover:-translate-y-0.5 active:translate-y-0'
                  }
                `}
              >
                {status === 'idle' || status === 'error' ? (
                  <>
                    <Headphones className="w-5 h-5" />
                    Start Production
                  </>
                ) : (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="animate-pulse">
                      {status === 'searching' && 'Searching Global News...'}
                      {status === 'scripting' && 'Writing Script...'}
                      {status === 'recording' && 'Recording Audio in Studio...'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 text-center text-slate-600 text-xs z-10">
        <p>Powered by Google Gemini 3 Flash (Search) & 2.5 TTS (Multi-Speaker).</p>
      </footer>
    </div>
  );
};

export default App;