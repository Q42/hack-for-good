<script lang="ts">
  import { navigate } from "svelte-routing";
  import firebase from "firebase";

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
    <input id="title-input" bind:value={title} type="text" />
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
  <button on:click={save}>Save</button>
</main>
