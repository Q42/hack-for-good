<script lang="ts">
  import { Doc, Collection } from "sveltefire";
  import { Link } from "svelte-routing";

  export let id = 0;

  function readableDate(timestamp) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return new Date(timestamp).toLocaleString(undefined, options);
  }
</script>

<Doc path="cases/{id}" let:data={caseInstance} let:ref={caseRef}>
  <header class="container">
    <Link to="/" getProps={() => ({ class: 'back' })}>↩ Home</Link>

    <h1>{caseInstance.name}</h1>
    <p>{caseInstance.description}</p>
  </header>

  <main class="container">
    <h2>Sensors</h2>
    <ul>
      {#each caseInstance.sensors as sensor}
        <li>{sensor}</li>
      {/each}
    </ul>

    <h2>Unseen notifications</h2>
    <Collection
      path={caseRef.collection('unseen_measurements')}
      let:data={measurements}>
      <ul>
        {#each measurements as measurement}
          <li>
            <Link to="/add-case-entry/{id}?measurement={measurement.id}">
              {measurement.formula}
              {measurement.diff}
              {measurement.type}
            </Link>
            <button on:click={() => measurement.ref.delete()}>Ignore</button>
          </li>
        {/each}
      </ul>
    </Collection>

    <h2>Case entries</h2>
    <Collection path={caseRef.collection('entries')} let:data={entries}>
      <ul>
        {#each entries as entry}
          <li class="entry">
            <h3 class="entry-title">{entry.title}</h3>
            <p class="timestamp">{readableDate(entry.timestamp.toDate())}</p>
            <p>{entry.description}</p>

            {#each entry.attachments as attachment}
              <div class="attachment">
                {#if attachment.type === 'photo'}
                  <figure>
                    <img src={attachment.url} alt={attachment.alt} />
                    <figcaption>{attachment.caption}</figcaption>
                  </figure>
                {/if}
              </div>
            {/each}
          </li>
        {/each}
      </ul>
    </Collection>
  </main>
</Doc>

<Link
  to="add-case-entry/{id}"
  getProps={() => ({ class: 'add-item', 'aria-label': 'add case item' })}>
  <span>⊕</span>
</Link>

<style>
  header {
    padding-top: 35px;
    padding-bottom: 5px;
  }

  header h1 {
    margin-top: 2px;
  }

  main {
    padding-bottom: 100px;
  }

  .timestamp {
    margin: 0;
    color: gray;
    font-size: small;
  }

  .entry-title {
    margin: 0;
  }

  .entry-title + p {
    margin-top: 0;
  }
</style>
