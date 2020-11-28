<script lang="ts">
  import { navigate } from "svelte-routing";
  import firebase from "firebase";

  import { Link } from "svelte-routing";
  import UploadImage from "./UploadImage.svelte";

  export let caseId: string;

  const db = firebase.firestore();

  let images: string[] = [];
  let title: string = "";
  let description: string = "";

  function imageUploadSucceeded(e: CustomEvent<{ downloadURL: string }>) {
    images = [...images, e.detail.downloadURL];
  }

  async function save() {
    const entry = {
      title,
      description,
      timestamp: firebase.firestore.Timestamp.now(),
      attachments: images.map((x) => ({
        type: "photo",
        alt: "",
        caption: "",
        url: x,
      })),
    };

    await db.collection(`cases/${caseId}/entries`).add(entry);

    navigate(`/case/${caseId}`);
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
    <label for="title-input">Title</label>
    <input id="title-input" bind:value={title} type="text" />
  </div>

  <div class="form-row">
    <label for="description-input">Description</label>
    <textarea id="description-input" bind:value={description} />
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

  <button on:click={save}>Save</button>
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
