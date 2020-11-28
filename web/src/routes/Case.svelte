<script lang="ts">
  import { Doc } from 'sveltefire';
  import { Link } from 'svelte-routing';

  export let id = 0;
</script>

<Doc path="cases/{id}" let:data={caseInstance} let:ref={caseRef}>
  <header class="container">
    <h1>
      { caseInstance.name }
    </h1>
    <p>
      { caseInstance.description }
    </p>
  </header>

  <main class="container">
    <h2>Sensors</h2>
    <ul>
      {#each caseInstance.sensors as sensor}
        <li>
          {sensor}
        </li>
      {/each}
    </ul>

    <h2>Case items</h2>
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
