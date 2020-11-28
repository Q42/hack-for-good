<script lang="ts">
  import { navigate } from "svelte-routing";
  import firebase from "firebase";
  import { Link } from "svelte-routing";
  import { parse } from "query-string";

  import UploadImage from "./UploadImage.svelte";

  export let caseId: string;
  export let location: any;

  const db = firebase.firestore();

  let measurements: any[] = [];
  let images: string[] = [];
  let title: string = "";
  let description: string = "";

  function imageUploadSucceeded(e: CustomEvent<{ downloadURL: string }>) {
    images = [...images, e.detail.downloadURL];
  }

  const { measurement } = parse(location.search);
  if (measurement) {
    db.doc(`cases/${caseId}/unseen_measurements/${measurement}`)
      .get()
      .then((res) => {
        if (!res) {
          return;
        }

        const newMeasurement = res.data();
        measurements = [...measurements, newMeasurement];
      });
  }

  async function save() {
    const imageAttachments = images.map((x) => ({
      type: "photo",
      alt: "",
      caption: "",
      url: x,
    }));

    const entry = {
      title,
      description,
      timestamp: firebase.firestore.Timestamp.now(),
      attachments: [...imageAttachments, ...measurements],
    };

    await db.collection(`cases/${caseId}/entries`).add(entry);

    if (measurement) {
      await db
        .doc(`cases/${caseId}/unseen_measurements/${measurement}`)
        .delete();
    }

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

  <Link to="case/{caseId}" getProps={() => ({ class: 'close' })}>
    <span>⊗</span>
  </Link>
</header>

<main class="container">
  <div class="form-row">
    <label for="title-input"> Title </label>
    <input id="title-input" bind:value={title} type="text" />
  </div>
  <div class="form-row">
    <label for="description-input"> Description </label>
    <textarea id="description-input" bind:value={description} />
  </div>
  <div class="form-row">
    <ul>
      {#each measurements as measurement}
        <li>
          <div>
            {measurement.formula}
            {measurement.diff}
            {measurement.sensorId}
            {measurement.timestamp}
            {measurement.type}
          </div>
        </li>
      {/each}
    </ul>
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
