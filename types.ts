
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  base64: string;
  status: 'pending' | 'ready' | 'error';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  metadata?: {
    isComparison?: boolean;
    citations?: Citation[];
  };
}

export interface Citation {
  fileName: string;
  page: number;
  snippet: string;
}

export interface ComparisonData {
  headers: string[];
  rows: Array<Record<string, string>>;
}
