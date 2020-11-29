<script lang="ts">
  import { Collection } from "sveltefire";
  import { Link } from "svelte-routing";
</script>

<header class="container">
  <h1>Casebuilder<br>Pro 3000</h1>
</header>

<main class="container">
  <h2>
    Current active cases
  </h2>

  <Collection path="cases" let:data={cases}>
    <ul>
      {#each cases as caseInstance}
        <li>
          <Link to="case/{caseInstance.id}">
            <h3>{caseInstance.name}</h3>
            <p>{caseInstance.description}</p>
          </Link>
        </li>
      {/each}
    </ul>
  </Collection>

  <Link to="/add-case" getProps={() => ({ class: 'button' })}>New case</Link>
</main>

<style>
  header {
    padding-top: 50px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li :global(a) {
    display: block;
    background: #e0e0e0;
    padding: 10px;
    border-radius: 5px;
    color: inherit;
    text-decoration: none;
  }

  li :global(a:hover) {
    color: rgb(0,100,200);
  }

  li h3 {
    margin: 0;
  }

  li p {
    margin: 0;
  }

  li + li {
    margin-top: 15px;
  }

  main :global(.button) {
    margin-top: 30px;
  }
</style>
