<script lang="ts">
  import { Doc, Collection } from 'sveltefire';
  import { Link } from 'svelte-routing';

  export let id = 0;

  function readableDate(timestamp) {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }

    return new Date(timestamp.seconds).toLocaleString(undefined, options)
  }
</script>

<Doc path="cases/{id}" let:data={caseInstance} let:ref={caseRef}>
  <header class="container">
    <Link to="/"  getProps={() => ({ class: 'back-to-home' })}>↩ Home</Link>

    <h1>
      { caseInstance.name }
    </h1>
    <p>
      { caseInstance.description }
    </p>
  </header>

  <main class="container">
    <h2>Sensors</h2>
    <ul>
      {#each caseInstance.sensors as sensor}
        <li>
          {sensor}
        </li>
      {/each}
    </ul>

    <h2>Case entries</h2>
    <Collection path={caseRef.collection('entries')} let:data={entries} let:ref={entryRef}>
      <ul>
        {#each entries as entry}
          <li class="entry">
            <h3 class="entry-title">
              {entry.title}
            </h3>
            <p class="timestamp">
              {readableDate(entry.timestamp)}
            </p>
            <p>
              {entry.description}
            </p>

            <Collection path={entryRef.doc(entry.id).collection('attachments')} let:data={attachments}>
              {#each attachments as attachment}
                <div class="attachment">
                  {#if attachment.type === "photo"}
                    <figure>
                      <img src={attachment.url} alt={attachment.alt}>
                      <figcaption>{attachment.caption}</figcaption>
                    </figure>
                  {/if}
                </div>
              {/each}
            </Collection>

          </li>
        {/each}
      </ul>
    </Collection>
  </main>
</Doc>

<Link to="add-case-entry/{id}" getProps={() => ({ class: 'add-item', 'aria-label': 'add case item' })}>
  <span>⊕</span>
</Link>

<style>
  header {
    background: #ddd;
    border-bottom: 1px solid grey;
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
