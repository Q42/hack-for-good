<script lang="ts">
  export let caseId = 0;
</script>

<header class="container">
  <h1>
    Add case entry
  </h1>
</header>

<main class="container">
  <div class="form-row">
    <label for="title-input">
      Title
    </label>
    <input id="title-input" type="text">
  </div>
</main>

<style>
  .form-row {
    display: flex;
  }

  label {
    margin-right: 25px;
  }

  input {
    flex-grow: 1;
  }
</style>
