import type { Attempt, Storage } from "./types";
import { dictionary } from "./dictionary";

export function isValidWord(word) {
  return word.length === 5 && dictionary.includes(word);
}

export function numericArray(size: number) {
  return new Array(size).fill(true).map((_, i) => i);
}

export function randomIndex(array) {
  return Math.floor(Math.random() * array.length);
}

export function pickWord(pastWords = [], currentWordIndex = null) {
  function pickIndex() {
    if (pastWords.length === 0) {
      return randomIndex(dictionary);
    }
    if (pastWords.length === dictionary.length) {
      updateStorage({ pastWords: [] });
      return randomIndex(dictionary);
    }

    const filteredIndices = Object.entries(dictionary).filter(
      ([id]) => !pastWords.includes(id)
    );

    const filteredIndex = randomIndex(filteredIndices);
    const pickedIndex = filteredIndices[filteredIndex][0];

    return pickedIndex;
  }

  const index = currentWordIndex ?? pickIndex();

  return {
    wordIndex: index,
    word: dictionary[index],
  };
}

const defaultStorageValues = {
  wordIndex: null,
  attempts: [],
  usedLetters: {},
  duration: 0,
  pastWords: [],
} as Storage;

export function parseStorage() {
  const storageValue = window.localStorage.getItem("wordham_history");
  let parsedStorage = defaultStorageValues;

  if (storageValue) {
    parsedStorage = { ...defaultStorageValues, ...JSON.parse(storageValue) };
  }

  return parsedStorage;
}

export function updateStorage(updater: ((state) => Storage) | Storage) {
  const storedState = parseStorage();
  const isFn = typeof updater === "function";
  const updatedState = isFn ? updater(storedState) : updater;
  const mergedState = { ...storedState, ...updatedState };
  const serializedState = JSON.stringify(mergedState);

  window.localStorage.setItem("wordham_history", serializedState);
}

export function disableDoubleTapZoom(event) {
  event.preventDefault();
  event.target.click();
}

export function emojiFromAttempts(attempts: Array<Attempt>) {
  const black = "\u2b1b";
  const yellow = "\ud83d\udfe8";
  const green = "\ud83d\udfe9";
  const valueToEmoji = {
    0: black,
    1: yellow,
    2: green,
  };

  const attemptsAsEmoji = [];

  for (const attempt of attempts) {
    const attemptAsEmoji = attempt.map(([, value]) => valueToEmoji[value]);
    attemptsAsEmoji.push(attemptAsEmoji);
  }

  const formattedForDisplay = attemptsAsEmoji
    .map((row) => row.join(""))
    .join("\n");

  return formattedForDisplay;
}

export function parseDuration(duration) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration - hours * 3600) / 60);
  const seconds = (duration - hours * 3600 - minutes * 60) % 60;

  const time = [
    hours && `${hours}h`,
    (minutes || hours) &&
      (!hours ? `${minutes}m` : `${minutes ?? ""}`.padStart(2, "0") + "m"),
    (seconds || minutes) && `${seconds ?? ""}`.padStart(2, "0") + "s",
  ].filter(Boolean);

  return time.join(":");
}
