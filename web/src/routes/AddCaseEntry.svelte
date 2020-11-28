<script lang="ts">
  import { Link } from 'svelte-routing';
  import UploadImage from "./UploadImage.svelte";

  export let caseId = 0;

  let images: string[] = [];

  function imageUploadSucceeded(e: CustomEvent<{ downloadURL: string }>) {
    images = [...images, e.detail.downloadURL];
  }
</script>

<div class="container header">
  <Link to="case/{caseId}" getProps={() => ({ class: 'back' })}>↩ Cancel</Link>

  <h1>
    Add case entry
  </h1>
</div>

<main class="container">
  <div class="form-row">
    <label for="title-input"> Title </label>
    <input id="title-input" type="text" name="title" />
  </div>

  <div class="form-row">
    <label for="description-input">Description</label>
    <input id="description-input" type="text" name="description" />
  </div>

  {#if images.length > 0}
    <ul>
      {#each images as image}
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <li><img src={image} alt="User uploaded image" /></li>
      {/each}
    </ul>
  {/if}

  <UploadImage on:imageUploadSucceeded={imageUploadSucceeded} />
</main>

<style>
  .header {
    padding-top: 35px;
  }

  h1 {
    margin-top: 0;
  }

  main.container {
    display: flex;
    flex-direction: column;
    gap: 21px;
  }

  .form-row {
    display: flex;
    flex-direction: column;
  }

  label {
    margin-bottom: 5px;
    font-weight: bold;
  }
</style>
