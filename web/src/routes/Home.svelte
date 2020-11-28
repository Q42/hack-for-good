<script lang="ts">
  import { Collection } from 'sveltefire';
  import { Link } from 'svelte-routing';
</script>

<h1>Home</h1>

<main class="container">
  <Collection path="cases" let:data={cases}>
    <ul>
      {#each cases as caseInstance}
        <li>
          <Link to="case/{caseInstance.id}">
            {caseInstance.name}
          </Link>
        </li>
      {/each}
    </ul>
  </Collection>
</main>

<style>
  h1 {
    text-align: center;
  }
</style>
