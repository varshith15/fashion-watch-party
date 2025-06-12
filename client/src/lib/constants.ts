// API Endpoints
export const API_ENDPOINTS = {
  SNAPSHOTS: '/api/snapshots',
  MODELS: '/api/models',
  DESIGNERS: '/api/designers',
  CHAT: '/api/chat/messages',
  TRIVIA: '/api/trivia/generate',
  TRY_ON: '/api/try-on',
  SHARE: '/api/share',
  STREAM: '/api/stream'
} as const;

// WebSocket Events
export const WS_EVENTS = {
  CHAT: 'chat',
  SNAPSHOT_CAPTURED: 'snapshot_captured',
  MODEL_DETECTED: 'model_detected',
  TRIVIA_UPDATE: 'trivia_update'
} as const;

// Content Types
export const CONTENT_TYPES = {
  TEXT: 'text',
  SNAPSHOT: 'snapshot',
  TRY_ON: 'try-on'
} as const;

// Social Media Platforms
export const SOCIAL_PLATFORMS = {
  INSTAGRAM: 'instagram',
  TWITTER: 'twitter',
  TIKTOK: 'tiktok'
} as const;

// Fashion Event Info
export const FASHION_EVENTS = {
  MILAN_2024: {
    name: 'Milan Fashion Week 2024',
    season: 'Spring/Summer 2024',
    location: 'Milan, Italy'
  }
} as const;

// Default hashtags for auto-generation
export const DEFAULT_HASHTAGS = [
  '#RunwayFashion',
  '#FashionStream',
  '#AIFashion',
  '#MilanFashionWeek',
  '#SS2024'
] as const;
