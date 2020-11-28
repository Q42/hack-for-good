<script lang="ts">
  import firebase from "firebase/app";
  import { createEventDispatcher } from "svelte";

  const storage = firebase.storage();
  const dispatch = createEventDispatcher();

  let files: FileList | undefined = undefined;
  let uploadButtonEnabled = false;

  firebase.auth().signInAnonymously();
  firebase.auth().onAuthStateChanged(() => {
    uploadButtonEnabled = true;
  });

  $: uploadImage(files);

  async function uploadImage(files: FileList | undefined) {
    let first = files?.item(0);
    if (!first) {
      return;
    }

    const ref = storage.ref().child(first.name);
    await ref.put(first);

    const downloadURL = await ref.getDownloadURL();
    dispatch("imageUploadSucceeded", {
      downloadURL,
    });
  }
</script>

<input
  type="file"
  disabled={!uploadButtonEnabled}
  accept="image/png, image/jpeg"
  id="file"
  bind:files />

<label for="file" class="button" class:disabled={!uploadButtonEnabled}>Add an image</label>

<style>
  input {
    border: 0;
    clip: rect(0, 0, 0, 0);
    height: 1px;
    overflow: hidden;
    padding: 0;
    position: absolute !important;
    white-space: nowrap;
    width: 1px;
  }

  input:focus + label {
    border-color: #666;
  }

  label {
    display: block;
    text-align: center;
    margin: 21px 0;
    padding: 20px;
    font-weight: bold;
  }

  label.disabled {
    opacity: 0.5;
    cursor: disabled;
  }
</style>
