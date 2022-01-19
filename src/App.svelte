<script lang="ts">
  import Game from "./components/Game.svelte";
  import {
    attempts,
    usedLetters,
    duration,
    currentAttempt,
  } from "./utilities/store";
  import { pickWord, parseStorage, updateStorage } from "./utilities/helpers";
  import { onMount } from "svelte";

  const state = parseStorage();

  let { wordIndex, word } = pickWord(state.pastWords, state.wordIndex);

  function updatePickedWord() {
    const newState = parseStorage();
    const { wordIndex: newWordIndex, word: newWord } = pickWord(
      newState.pastWords
    );

    wordIndex = newWordIndex;
    word = newWord;
  }

  function startNewGame() {
    updatePickedWord();

    updateStorage({
      wordIndex,
      attempts: [],
      usedLetters: {},
      duration: 0,
    });

    $attempts = [];
    $usedLetters = {};
    $duration = 0;
    $currentAttempt = "";
  }

  onMount(() => {
    if ("wordIndex"! in state) {
      updateStorage({ wordIndex });
    }

    if ("attempts" in state) {
      $attempts = state.attempts;
      $usedLetters = state.usedLetters;
    }
  });
</script>

<Game targetWord={word} {startNewGame} />
