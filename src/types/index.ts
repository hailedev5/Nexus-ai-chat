export type ParticipantType = 'human' | 'ai';

export interface Persona {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: string;
  bio: string;
  personality: string;
  isAi: boolean;
  status: 'online' | 'idle' | 'busy' | 'offline';
  statusText?: string;
  badgeColor?: string;
  tone?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  status: 'online' | 'idle' | 'busy' | 'offline';
  statusText: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[]; // user/persona ids
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderHandle: string;
  senderAvatar: string;
  isAi: boolean;
  isCurrentUser?: boolean;
  text: string;
  timestamp: string;
  reactions: MessageReaction[];
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  attachmentUrl?: string;
}

export interface Room {
  id: string;
  name: string;
  topic: string;
  description: string;
  icon: string;
  isDirectMessage: boolean;
  dmParticipantId?: string; // If 1-on-1 DM
  participantIds: string[]; // Persona IDs present in this room
  unreadCount?: number;
}
