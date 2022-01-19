<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    currentAttempt,
    attempts,
    usedLetters,
    duration,
  } from "../utilities/store";
  import {
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

      $usedLetters = $usedLetters;
    }
  }

  $: currentAttemptAsArray = [...$currentAttempt].map((letter) => [letter]);

  function handleInput(key) {
    if (/^[a-zA-Z]$/.test(key)) {
      if ($currentAttempt.length < 5) {
        $currentAttempt += key.toLowerCase();
      }
    } else if (["Backspace", "del"].includes(key)) {
      if ($currentAttempt.length > 0) {
        $currentAttempt = $currentAttempt.slice(0, -1);
      }
    } else if (["Enter", "ent"].includes(key)) {
      if ($currentAttempt.length === 5) {
        registerAttempt($currentAttempt);
      }
    }
  }

  $: showNewGameButton =
    $attempts.length === 6 ||
    (targetWord &&
      targetWord ===
        $attempts[$attempts.length]?.map(([letter]) => letter).join(""));

  let interval;

  function handleKeydown(event) {
    if (!interval) {
      interval = setInterval(() => {
        $duration += 1;
      }, 1000);
    }

    if (!event.metaKey && !showNewGameButton) {
      return handleInput(event.key);
    }
  }

  function triggerVictory() {
    const triesNum = $attempts.length;
    const triesText = `${triesNum} tr${triesNum === 1 ? "y" : "ies"}`;
    const emoji = emojiFromAttempts($attempts);
    const emojiText = emoji.map((row) => row.join("")).join("\n");
    const parsedDuration = parseDuration($duration);

    // TODO: replace alert with modal and "Copy" button
    setTimeout(() => {
      alert(
        `You did it in ${triesText}!\n\n` +
          `Tell your friends:\n\n` +
          `Wordham: ${triesNum}/6 in ${parsedDuration}\n\n` +
          emojiText
      );
    }, 0);

    updateStorage((state) => ({
      pastWords: [...state.pastWords, state.wordIndex],
    }));
  }

  function triggerDefeat() {
    setTimeout(() => {
      alert("Oooh, better luck next time!");
    }, 0);
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

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
  });

  onDestroy(() => {
    document.removeEventListener("keydown", handleKeydown);
    clearInterval(interval);
  });
</script>

<main>
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
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 375px;
    height: 100%;
    margin: 0 auto;
  }

  #attempts {
    width: 100%;
  }

  button {
    opacity: 0;
    width: 40%;
    height: 60px;
    margin: 15px auto;
    background-color: var(--include);
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
