<script lang="ts">
  import { navigate } from "svelte-routing";
  import firebase from "firebase";
  import { Link } from "svelte-routing";

  const db = firebase.firestore();

  let name: string = "";
  let description: string = "";
  let subscribers: string[] = [];

  async function save() {
    const entry = {
      name,
      description,
      subscribers,
      sensors: [],
    };

    const newCase = await db.collection("cases").add(entry);

    navigate(`/case/${newCase.id}`);
  }
</script>

<style>
  h1 {
    margin-top: 2px;
  }

  ul,
  li {
    list-style-type: none;
    margin: 0px;
    padding: 0px;
  }

  li {
    margin: 5px 0px;
  }

  .form-row {
    display: flex;
    flex-direction: column;
  }

  .form-row + .form-row {
    margin-top: 21px;
  }

  .form-row label {
    margin-bottom: 5px;
    font-weight: bold;
  }
</style>

<div class="container header">
  <Link to="/" getProps={() => ({ class: 'back' })}>↩ Cancel</Link>

  <h1>Add case</h1>
</div>

<div class="container">
  <div class="form-row">
    <label for="title-input">Title</label>
    <input id="title-input" bind:value={name} type="text" />
  </div>

  <div class="form-row">
    <label for="description-input">Description</label>
    <textarea id="description-input" bind:value={description} />
  </div>

  <div class="form-row">
    <label for="description-input">Subscribers</label>
    <ul>
      {#each subscribers as subscriber}
        <li>{subscriber}</li>
      {/each}
      <li>
        <input
          type="text"
          placeholder="Phone number"
          on:keyup={(e) => {
            if (e.key === 'Enter') {
              subscribers = [...subscribers, e.target.value];
              e.target.value = '';
            }
          }} />
      </li>
    </ul>
  </div>
</div>

<div class="container"><button on:click={save}>Save this case</button></div>
