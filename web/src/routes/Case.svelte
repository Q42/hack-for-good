<script lang="ts">
  import { Doc } from 'sveltefire';
  import { Link } from 'svelte-routing';

  export let id = 0;
</script>

<Doc path="cases/{id}" let:data={caseEntry}>
  <header class="container">
    <h1>
      { caseEntry.name }
    </h1>
    <p>
      { caseEntry.description }
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
</Doc>

<Link to="case-item/{id}" getProps={() => ({ class: 'add-item', 'aria-label': 'add case item' })}>
  <span>+</span>
</Link>

<style>
  header {
    background: #ddd;
    border-bottom: 1px solid grey;
    padding-bottom: 5px;
  }
</style>
