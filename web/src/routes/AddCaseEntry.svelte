<script lang="ts">
  import { navigate } from "svelte-routing";
  import firebase from "firebase";
  import { Link } from "svelte-routing";
  import { parse } from "query-string";

  import UploadImage from "./UploadImage.svelte";

  export let caseId: string;
  export let location: any;

  const db = firebase.firestore();

  type Image = {
    caption: string,
    alt: string,
    url: string
  }

  let measurements: any[] = [];
  let images: Image[] = [];
  let title: string = "";
  let description: string = "";

  function imageUploadSucceeded(e: CustomEvent<{ downloadURL: string }>) {
    images = [...images, {
      caption: '',
      alt: '',
      url: e.detail.downloadURL
    }];
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
      alt: x.alt,
      caption: x.caption,
      url: x.url,
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

<div class="container header">
  <Link to="case/{caseId}" getProps={() => ({ class: 'back' })}>↩ Cancel</Link>

  <h1>
    Add case entry
  </h1>
</div>

<div class="container">
  <div class="form-row">
    <label for="title-input">Title</label>
    <input id="title-input" bind:value={title} type="text" />
  </div>

  <div class="form-row">
    <label for="description-input">Description</label>
    <textarea id="description-input" bind:value={description} />
  </div>
</div>

<div class="container bg">
  <h2>
    Images
  </h2>

  {#if images.length > 0}
    <ul>
      {#each images as image, i}
        <li>
          <div class="form-row">
            <p class="label">Preview</p>
            <img src={image.url} alt="Upload number {i + 1}" />
          </div>

          <div class="form-row">
            <label for="alt-input-{i}">Alt</label>
            <input type="text" id="alt-input-{i}" bind:value={image.alt} />
          </div>

          <div class="form-row">
            <label for="caption-input-{i}">Caption</label>
            <input type="text" id="caption-input-{i}" bind:value={image.caption} />
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <h3>no images added yet</h3>
  {/if}

  <UploadImage on:imageUploadSucceeded={imageUploadSucceeded} />
</div>

{#if measurements.length > 0}
  <div class="container">
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
  </div>
{/if}

<div class="container">
  <button on:click={save}>Save this entry</button>
</div>

<style>
  .header {
    padding-top: 35px;
  }

  h1 {
    margin-top: 0;
  }

  h3 {
    text-align: center;
    color: #888;
  }

  .form-row {
    display: flex;
    flex-direction: column;
  }

  .form-row + .form-row {
    margin-top: 21px;
  }

  .form-row label,
  .form-row .label {
    margin-bottom: 5px;
    font-weight: bold;
  }

  .container.bg {
    background: #eee;
    margin: 20px 0;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    padding-bottom: 30px;
  }

  li:not(:last-child) {
    border-bottom: 1px solid #ccc;
  }
</style>
