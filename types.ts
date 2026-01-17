export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  dateAdded: number;
}

export enum VoiceName {
  Kore = 'Kore',
  Puck = 'Puck',
  Charon = 'Charon',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export type HostPairId = 'morning-show' | 'news-desk' | 'deep-dive';

export interface HostPair {
  id: HostPairId;
  name: string;
  description: string;
  speaker1: VoiceName;
  speaker2: VoiceName;
  speaker1Name: string;
  speaker2Name: string;
}

export const HOST_PAIRS: Record<HostPairId, HostPair> = {
  'morning-show': {
    id: 'morning-show',
    name: 'The Morning Jolt',
    description: 'Energetic and fast-paced.',
    speaker1: VoiceName.Kore, // Female
    speaker2: VoiceName.Zephyr, // Male
    speaker1Name: 'Sarah',
    speaker2Name: 'Mike'
  },
  'news-desk': {
    id: 'news-desk',
    name: 'Global News Desk',
    description: 'Professional and authoritative.',
    speaker1: VoiceName.Fenrir, // Male
    speaker2: VoiceName.Puck, // Female
    speaker1Name: 'James',
    speaker2Name: 'Elena'
  },
  'deep-dive': {
    id: 'deep-dive',
    name: 'Deep Dive Analysis',
    description: 'Calm, thoughtful, and detailed.',
    speaker1: VoiceName.Charon, // Male
    speaker2: VoiceName.Kore, // Female
    speaker1Name: 'Dr. Vance',
    speaker2Name: 'Julia'
  }
};

export type Timeframe = 'Last Hour' | 'Last 24 Hours' | 'Past Week';

export interface PodcastConfig {
  interests: string[];
  publications: string[]; // Changed to array for multiple selections
  duration: 'Short' | 'Medium' | 'Long';
  timeframe: Timeframe;
  hostPairId: HostPairId;
}

export interface GeneratedPodcast {
  id: string;
  script: string;
  audioUrl: string; // Blob URL
  createdAt: number;
  title: string;
  sources: Array<{ title: string; uri: string }>;
}

export interface WavHeader {
  sampleRate: number;
  numChannels: number;
  bitsPerSample: number;
}