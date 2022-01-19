<script lang="ts">
  import { usedLetters } from "../utilities/store";

  export let handleInput;

  const rows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", "del"],
    ["z", "x", "c", "v", "b", "n", "m", "ent"],
  ];

  const colorClass = {
    0: "exclude",
    1: "include",
    2: "correct",
  };

  function handleButtonInput(key) {
    const input = document.getElementById("attempt") as HTMLInputElement;
    if (key === "ent") {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    } else if (key === "del") {
      input.value = input.value.slice(0, -1);
    } else if (input.value.length < 5) {
      input.value += key;
    }
    input.focus();
  }
</script>

<div class="keyboard-container">
  {#each rows as row}
    <div class="button-row">
      {#each row as key}
        <button
          class={colorClass[$usedLetters[key]] ?? ""}
          on:click={() => handleInput(key)}
        >
          {key.toUpperCase()}
        </button>
      {/each}
    </div>
  {/each}
</div>

<style lang="scss">
  .keyboard-container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }

  .button-row {
    display: flex;
    justify-content: space-between;
    width: 100%;

    &:nth-child(3) {
      width: 86%;
    }
  }

  button {
    flex-grow: 1;
    margin-top: 8px;
    margin-right: 2px;
    padding: 0;
    width: 100%;
    height: 50px;
    border: 1px solid var(--border-color);
    border-radius: 3px;
    background-color: var(--default);
    font-size: 14px;
    font-weight: bold;
    color: var(--border-color);

    &:last-child {
      margin-right: 0;
    }
  }

  .exclude {
    background-color: var(--exclude);
  }

  .include {
    background-color: var(--include);
  }

  .correct {
    background-color: var(--correct);
  }
</style>
