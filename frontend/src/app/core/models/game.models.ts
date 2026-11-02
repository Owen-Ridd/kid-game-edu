export type GameStatus = 'DRAFT' | 'PUBLISHED';

export interface Bucket {
  id: string;
  imageUrl: string;
}

export interface GameItem {
  id: string;
  imageUrl: string;
  targetBucketId: string;
}

export interface Game {
  id?: string;
  title: string;
  status: GameStatus;
  buckets: Bucket[];
  items: GameItem[];
}

export interface Session {
  id?: string;
  gameId: string;
  pinCode: string;
  groupName: string;
  mistakeCount: number;
  active: boolean;
}

export interface GameplaySession {
  session: Session;
  game: Game;
}