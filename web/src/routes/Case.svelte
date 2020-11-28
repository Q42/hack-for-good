<script lang="ts">
  import { Link } from 'svelte-routing';

  export let id = 0;
</script>

<header class="container">
  <h1>
    Case #{ id }
  </h1>
  <p>
    Case description
  </p>
</header>

<main class="container">
  <p>
    Case item 1
  </p>
  <p>
    Case item 2
  </p>
</main>

<Link to="case-item" getProps={() => ({ class: 'add-item', 'aria-label': 'add case item' })}>
  <span>+</span>
</Link>

<style>
  header {
    background: #ddd;
    border-bottom: 1px solid grey;
    padding-bottom: 5px;
  }
</style>
