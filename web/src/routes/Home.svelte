<script lang="ts">
  import { Collection } from 'sveltefire';
  import { Link } from 'svelte-routing';
</script>

<header class="container">
  <h1>
    Casebuilder <span>Pro 3000</span>
  </h1>
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
  }

  h1 span {
    display: inline-block;
  }
</style>
