<script lang="ts">
  import { Collection } from 'sveltefire';
  import { Link } from 'svelte-routing';
</script>

<header class="container">
  <h1>Casebuilder<br>Pro 300</h1>
</header>

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
  header {
    padding-top: 50px;
    margin-bottom: 50px;
  }

  h1 {
    margin: 0 auto;
    width: auto;
    text-align: center;
    background: #eee;
    margin-bottom: -50px;
    padding: 0.5em 0;
    border: 1px solid gray
  }
</style>
