import React, { useState } from 'react';
import { Newspaper, Clock, Hash, Radio, Calendar } from 'lucide-react';
import { PodcastConfig, HOST_PAIRS, HostPairId, Timeframe } from '../types';

interface PreferencesInputProps {
  config: PodcastConfig;
  setConfig: React.Dispatch<React.SetStateAction<PodcastConfig>>;
  disabled: boolean;
}

const INTERESTS = ['Technology', 'Business', 'World Politics', 'Science', 'Health', 'Sports', 'Entertainment', 'Cryptocurrency', 'AI & Future'];
const POPULAR_SOURCES = ['The New York Times', 'BBC News', 'The Verge', 'TechCrunch', 'Reuters', 'Bloomberg', 'ESPN', 'Wired'];

const PreferencesInput: React.FC<PreferencesInputProps> = ({ config, setConfig, disabled }) => {
  const [customSource, setCustomSource] = useState('');

  const toggleInterest = (interest: string) => {
    if (config.interests.includes(interest)) {
      setConfig({ ...config, interests: config.interests.filter(i => i !== interest) });
    } else {
      if (config.interests.length < 5) {
        setConfig({ ...config, interests: [...config.interests, interest] });
      }
    }
  };

  const toggleSource = (source: string) => {
    if (config.publications.includes(source)) {
      setConfig({ ...config, publications: config.publications.filter(s => s !== source) });
    } else {
      setConfig({ ...config, publications: [...config.publications, source] });
    }
  };

  const addCustomSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSource && !config.publications.includes(customSource)) {
      setConfig({ ...config, publications: [...config.publications, customSource] });
      setCustomSource('');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Timeframe */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-pink-400" />
          News Timeframe
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['Last Hour', 'Last 24 Hours', 'Past Week'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setConfig({...config, timeframe: tf})}
              disabled={disabled}
              className={`
                py-2 rounded-lg text-xs font-medium transition-all border
                ${config.timeframe === tf
                  ? 'bg-pink-600/20 border-pink-500 text-pink-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }
                disabled:opacity-50
              `}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interests */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Hash className="w-4 h-4 text-blue-400" />
          Topics of Interest (Max 5)
        </label>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map(interest => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              disabled={disabled}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                ${config.interests.includes(interest)
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-sm'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }
                disabled:opacity-50
              `}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Publications */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-emerald-400" />
          Preferred Publications
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {POPULAR_SOURCES.map(source => (
            <button
              key={source}
              onClick={() => toggleSource(source)}
              disabled={disabled}
              className={`
                px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border
                ${config.publications.includes(source)
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                }
                disabled:opacity-50
              `}
            >
              {source}
            </button>
          ))}
        </div>
        <form onSubmit={addCustomSource} className="flex gap-2">
          <input
            type="text"
            value={customSource}
            onChange={(e) => setCustomSource(e.target.value)}
            disabled={disabled}
            placeholder="Add specific source..."
            className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-slate-200 placeholder-slate-500 text-xs"
          />
          <button 
            type="submit"
            disabled={!customSource || disabled}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium disabled:opacity-50"
          >
            Add
          </button>
        </form>
        {config.publications.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
             {config.publications.filter(p => !POPULAR_SOURCES.includes(p)).map(p => (
               <span key={p} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 text-[10px]">
                 {p}
                 <button onClick={() => toggleSource(p)} className="hover:text-white">×</button>
               </span>
             ))}
          </div>
        )}
      </div>

      {/* 4. Host Pair */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Radio className="w-4 h-4 text-purple-400" />
          Your Hosts
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.values(HOST_PAIRS).map((pair) => (
            <button
              key={pair.id}
              onClick={() => setConfig({...config, hostPairId: pair.id})}
              disabled={disabled}
              className={`
                p-3 rounded-xl border text-left transition-all relative overflow-hidden
                ${config.hostPairId === pair.id
                  ? 'bg-purple-600/10 border-purple-500'
                  : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                }
              `}
            >
              <div className={`text-xs font-bold mb-1 ${config.hostPairId === pair.id ? 'text-purple-400' : 'text-slate-300'}`}>
                {pair.name}
              </div>
              <div className="text-[10px] text-slate-500 mb-2">{pair.speaker1Name} & {pair.speaker2Name}</div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {pair.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Duration */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Podcast Duration
        </label>
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
          {['Short', 'Medium', 'Long'].map((d) => (
            <button
              key={d}
              onClick={() => setConfig({...config, duration: d as any})}
              disabled={disabled}
              className={`
                flex-1 py-1.5 text-xs font-medium rounded-md transition-all
                ${config.duration === d
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-300'
                }
              `}
            >
              {d}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 text-right">
          {config.duration === 'Short' ? '~2 mins' : config.duration === 'Medium' ? '~5 mins' : '~8 mins'}
        </p>
      </div>
    </div>
  );
};

export default PreferencesInput;