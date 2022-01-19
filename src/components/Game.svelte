<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    currentAttempt,
    attempts,
    usedLetters,
    duration,
  } from "../utilities/store";
  import {
    disableDoubleTapZoom,
    emojiFromAttempts,
    isValidWord,
    numericArray,
    parseDuration,
    updateStorage,
  } from "../utilities/helpers";
  import Attempt from "./Attempt.svelte";
  import Keyboard from "./Keyboard.svelte";

  export let targetWord;
  export let startNewGame;

  $: attemptNum = $attempts.length;
  const totalAttempts = numericArray(6);

  function registerAttempt(attemptWord: string) {
    if (isValidWord(attemptWord)) {
      // Default each letter to 'not in word' value
      const newAttempt = [...attemptWord].map((letter) => [letter, 0]);

      // Check how often each letter appears in target word
      const letterCounts = [...targetWord].reduce((result, letter) => {
        if (!(letter in result)) {
          result[letter] = 0;
        }
        result[letter]++;
        return result;
      }, {});

      // Check for correct positions and update value
      newAttempt.forEach((_, index) => {
        const letter = attemptWord[index];
        if (letter === targetWord[index]) {
          letterCounts[letter]--;
          newAttempt[index] = [letter, 2];
        }
      });

      // Check for incorrect positions and update value
      newAttempt.forEach((_, index) => {
        const letter = attemptWord[index];
        if (
          letter !== targetWord[index] &&
          letter in letterCounts &&
          letterCounts[letter] > 0
        ) {
          letterCounts[letter]--;
          newAttempt[index] = [letter, 1];
        }
      });

      // Add the attempt to the array and trigger state update
      $attempts = [...$attempts, newAttempt];
      updateUsedLetters(newAttempt);
      updateStorage({
        usedLetters: $usedLetters,
        attempts: $attempts,
      });
      // Clear input after each attempt
      $currentAttempt = "";

      if (attemptWord === targetWord) {
        triggerVictory();
      } else if ($attempts.length === 6) {
        triggerDefeat();
      }
    } else {
      alert(`"${attemptWord.toUpperCase()}" is not in the game dictionary.`);
    }
  }

  function updateUsedLetters(attempt) {
    for (const [letter, value] of attempt) {
      if (!(letter in $usedLetters) || $usedLetters[letter] < value) {
        $usedLetters[letter] = value;
      }
    }
    // Triggers state update and re-render
    $usedLetters = $usedLetters;
  }

  function triggerVictory() {
    const triesNum = $attempts.length;
    const triesText = `${triesNum} tr${triesNum === 1 ? "y" : "ies"}`;
    const emoji = emojiFromAttempts($attempts);
    const parsedDuration = parseDuration($duration);

    // TODO: replace alert with modal and "Copy" button
    setTimeout(() => {
      alert(
        `You did it in ${triesText}!\n\n` +
          `Tell your friends:\n\n` +
          `Wordham: ${triesNum}/6 in ${parsedDuration}\n\n` +
          emoji
      );
    }, 0);

    // Add guessed word to previous words
    updateStorage((state) => ({
      pastWords: [...state.pastWords, state.wordIndex],
    }));
  }

  function triggerDefeat() {
    setTimeout(() => {
      alert("Oooh, better luck next time!");
    }, 0);
  }

  // Derived state for text in `startNewGame` button
  $: showNewGameButton =
    $attempts.length === 6 ||
    (targetWord &&
      targetWord ===
        $attempts[$attempts.length]?.map(([letter]) => letter).join("")) ||
    ($attempts.length && !interval);

  // Setup timer to track duration
  let interval;
  // Start timer on first keypress
  function handleKeydown(event) {
    if (!interval) {
      interval = setInterval(() => {
        $duration += 1;
      }, 1000);
    }

    // Don't do anything if the meta key or "New Game" are visible
    if (!event.metaKey && !showNewGameButton) {
      return handleInput(event.key);
    }
  }

  function handleInput(key) {
    if (/^[a-zA-Z]$/.test(key) && $currentAttempt.length < 5) {
      $currentAttempt += key.toLowerCase();
    } else if (
      ["Backspace", "del"].includes(key) &&
      $currentAttempt.length > 0
    ) {
      $currentAttempt = $currentAttempt.slice(0, -1);
    } else if (["Enter", "ent"].includes(key) && $currentAttempt.length === 5) {
      registerAttempt($currentAttempt);
    }
  }

  function handleNewGame(event) {
    if (!showNewGameButton) {
      const wantsReset = window.confirm(
        "Are you sure you want to reset and choose a new word to guess?"
      );

      if (wantsReset) {
        startNewGame();
      }
    } else {
      startNewGame();
    }
    event.target.blur();
  }

  $: currentAttemptAsArray = [...$currentAttempt].map((letter) => [letter]);

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("touchend", disableDoubleTapZoom);
  });

  onDestroy(() => {
    document.removeEventListener("keydown", handleKeydown);
    document.removeEventListener("touchend", disableDoubleTapZoom);
    clearInterval(interval);
  });
</script>

<div id="attempts">
  {#each totalAttempts as attemptIndex}
    <Attempt
      isCurrent={attemptIndex === attemptNum}
      attempt={attemptIndex === attemptNum
        ? currentAttemptAsArray
        : $attempts[attemptIndex]}
    />
  {/each}
</div>
<Keyboard {handleInput} />
<button
  on:click={handleNewGame}
  class:show={$attempts.length}
  class:isNew={showNewGameButton}
>
  {showNewGameButton ? "New Game" : "Skip Word"}
</button>

<style lang="scss">
  #attempts {
    width: 100%;
  }

  button {
    opacity: 0;
    width: 40%;
    height: 60px;
    margin: 15px auto;
    background-color: var(--include);
    border: 1px solid var(--border-color);
    border-radius: 5px;
    color: var(--border-color);
    font-size: 20px;
    transition: 400ms;

    &.isNew {
      background-color: var(--correct);
    }

    &.show {
      opacity: 1;
    }
  }
</style>
