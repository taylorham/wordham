<script lang="ts">
  import { numericArray } from "../utilities/helpers";

  export let attempt = [];
  export let isCurrent = false;

  const numLetters = numericArray(5);

  const colors = {
    0: "exclude",
    1: "include",
    2: "correct",
  };
</script>

<div class="attempt-container">
  {#each numLetters as index}
    <span
      class="attempt-letter {isCurrent ? '' : colors[attempt?.[index]?.[1]]}"
    >
      {attempt?.[index]?.[0].toUpperCase() ?? ""}
    </span>
  {/each}
</div>

<style lang="scss">
  .attempt-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 10px;
  }

  .attempt-letter {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;
    width: 18%;
    border: 2px solid var(--border-color);
    background-color: var(--default);
    font-family: Helvetica, Monaco, sans-serif;
    font-weight: bold;
    font-size: 44px;

    &.exclude {
      background-color: var(--exclude);
    }
    &.include {
      background-color: var(--include);
    }
    &.correct {
      background-color: var(--correct);
    }
  }
</style>
