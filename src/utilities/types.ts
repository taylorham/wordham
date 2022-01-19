export type Letter = [string, number?];

export type PastWords = Array<number>;

export type Attempt = Array<Letter>;

export type UsedLetters = {
  [key: string]: number;
};

export type PickedWord = {
  wordIndex: number;
  word: string;
};

export type GameState = {
  attempts?: Array<Attempt>;
  usedLetters?: UsedLetters;
  duration?: number;
};

export type Storage = GameState & {
  pastWords?: Array<number>;
  wordIndex?: number;
};
