<script>
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

<button aria-label="add case item" class="add-item">
  +
</button>

<style>
  header {
    background: #ddd;
    border-bottom: 1px solid grey;
    padding-bottom: 5px;
  }

  button.add-item {
    position: fixed;
    left: calc(50% - 30px);
    bottom: 10px;
    width: 60px;
    height: 60px;
    border-radius: 99px;
  }
</style>
