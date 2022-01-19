import { writable } from "svelte/store";

export const currentAttempt = writable("");
export const attempts = writable([]);
export const usedLetters = writable({});
export const duration = writable(0);
