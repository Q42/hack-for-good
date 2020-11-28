<script lang="ts">
  import firebase from "firebase/app";

  const storage = firebase.storage();

  let files: FileList | undefined = undefined;

  let userCredentials = firebase.auth().signInAnonymously();

  $: uploadImage(files);

  function uploadImage(files: FileList | undefined) {
    let first = files?.item(0);
    if (!first) {
      return;
    }

    const ref = storage.ref().child(first.name);
    ref.put(first).then((res) => {
      console.log(res);
    });
  }
</script>

<div>
  {#await userCredentials}
    <p>Waiting for user to login</p>
  {:then user}
    <p>User is logged in</p>

    <input type="file" accept="image/png, image/jpeg" bind:files />
  {/await}
</div>
