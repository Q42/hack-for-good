<script lang="ts">
  import App from "../App.svelte";
  import UploadImage from "./UploadImage.svelte";

  export let caseId = 0;

  let images: string[] = [];

  function imageUploadSucceeded(e: CustomEvent<{ downloadURL: string }>) {
    images = [...images, e.detail.downloadURL];
  }
</script>

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

<header class="container">
  <h1>Add case entry</h1>
</header>

<main class="container">
  <div class="form-row">
    <label for="title-input"> Title </label>
    <input id="title-input" type="text" />
  </div>
  <div class="form-row">
    <UploadImage on:imageUploadSucceeded={imageUploadSucceeded} />
    <ul>
      {#each images as image}
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <li><img src={image} alt="User uploaded image" /></li>
      {/each}
    </ul>
  </div>
</main>
