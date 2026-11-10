export interface GroundingSource {
  title: string;
  url: string;
}

export interface GroundingMetadata {
  searchQueries?: string[];
  sources?: GroundingSource[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  groundingMetadata?: GroundingMetadata;
  isStreaming?: boolean;
}

export interface CuratorSettings {
  apiKey: string;
  searchEnabled: boolean;
  model: string;
}

export interface WorksheetData {
  itemName: string;
  whenUsed: string;
  whoUsed: string;
  howUsed: string;
  conclusionBlank: string;
}
