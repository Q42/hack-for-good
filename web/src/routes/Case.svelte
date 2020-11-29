<script lang="ts">
  import { Doc, Collection } from "sveltefire";
  import { Link } from "svelte-routing";

  export let id = 0;

  let addingSensor = false;

  const entriesQuery = (ref) => ref.orderBy("timestamp", "desc");
  const unseenMeasurementsQuery = (ref) => ref.orderBy("timestamp", "desc");

  function readableDate(timestamp) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return new Date(timestamp).toLocaleString(undefined, options);
  }

  function readableAnomaly(attachment) {
    if (attachment.type === "ANOMALOUS_INCREASE") {
      return `Anomalous increase in ${attachment.formula}. Deviation: ${attachment.diff}`;
    }

    if (attachment.type === "ANOMALOUS_DECREASE") {
      return `Anomalous decrease in ${attachment.formula}. Deviation: ${attachment.diff}`;
    }

    if (attachment.type === "ANOMALOUS_TIMESERIES") {
      return `Anomalous timeseries for ${attachment.formula}`;
    }

    return "Anomaly";
  }

  function getPercentage(caseInstance) {
    return Math.random() * 100;
  }
</script>

<Doc path="cases/{id}" let:data={caseInstance} let:ref={caseRef}>
  <header class="container">
    <Link to="/" getProps={() => ({ class: 'back' })}>↩ Home</Link>

    <h1>{caseInstance.name}</h1>
    <p>{caseInstance.description}</p>

    <div class="progress">
      <span style="width: {getPercentage(caseInstance)}%"></span>
    </div>
  </header>

  <Collection
    path={caseRef.collection('unseen_measurements')}
    query={unseenMeasurementsQuery}
    let:data={measurements}> 
    {#if measurements.length > 0}
      <div class="container notifications">
        <h2>Unseen notifications</h2>

        <ul>
          {#each measurements as measurement}
            <li>
              <p>
                ⚠ {`${readableAnomaly(measurement.type)} in ${measurement.formula}.`}
              </p>

              <Link to="/add-case-entry/{id}?measurement={measurement.id}" getProps={() => ({ class: 'button' })}>
                Add to case
              </Link>
              <button on:click={() => measurement.ref.delete()} class="link">Ignore</button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </Collection>

  <div class="container sensors">
    <h2>Sensors</h2>
    <p>You are currently subscribed to anomalous activity on these sensors:</p>

    <ul>
      {#each caseInstance.sensors as sensor}
        <li>{sensor}</li>
      {/each}
    </ul>
    {#if !addingSensor}
      <button on:click={() => (addingSensor = true)}>Add</button>
    {:else}
      <input
        type="text"
        on:keyup={async (e) => {
          if (e.key === 'Enter') {
            await caseRef.update({
              sensors: [...caseInstance.sensors, e.target.value],
            });

            addingSensor = false;
          }
        }} />
    {/if}
  </div>

  <div class="container entries">
    <h2>Case entries</h2>
    <Collection
      path={caseRef.collection('entries')}
      query={entriesQuery}
      let:data={entries}>
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
                {:else}
                  <div class="sensor">
                    <span>Sensor reading:</span>
                    {readableAnomaly(attachment)}
                  </div>
                {/if}
              </div>
            {/each}
          </li>
        {/each}
      </ul>
    </Collection>
  </div>
</Doc>

<Link
  to="add-case-entry/{id}"
  getProps={() => ({ class: 'add-item', 'aria-label': 'add case item' })}>
  <span>⊕</span>
</Link>

<style>
  header {
    padding-top: 35px;
  }

  header h1 {
    margin-top: 2px;
  }

  div.container:last-of-type {
    padding-bottom: 100px;
  }

  .notifications ul,
  .entries ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .notifications li {
    background: rgb(236 227 205);
    padding: 10px;
    border-radius: 5px;
  }

  .notifications li + li {
    margin-top: 10px;
  }

  .notifications li p {
    margin-top: 0;
  }

  .notifications li .link {
    float: right;
    margin-top: 12px;
    margin-right: 10px;
  }

  .entries li + li {
    margin-top: 30px;
    padding-top: 30px;
    border-top: 1px solid #ccc;
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

  .sensor {
    background-color: #e0e0e0;
    padding: 10px;
    border-radius: 5px;
  }

  .attachment + .attachment {
    margin-top: 15px;
  }
</style>