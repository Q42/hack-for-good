<script lang="ts">
  import { Collection } from 'sveltefire';
  import { Link } from 'svelte-routing';
</script>

<h1>Home</h1>

<main class="container">
  <Collection path="cases" let:data={cases}>
    <ul>
      {#each cases as caseEntry}
        <li>
          <Link to="case/{caseEntry.id}">
            {caseEntry.name}
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
