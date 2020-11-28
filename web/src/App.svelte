<script lang="ts">
	import { Router, Route } from "svelte-routing";
	import Error404 from './routes/404.svelte';
	import Home from './routes/Home.svelte';
	import Case from './routes/Case.svelte';
	import CaseItem from './routes/CaseItem.svelte';

	export let url = "";
</script>

<Router url="{url}">
	<Route path="case/:id" component="{Case}" />
	<Route path="case-item/:case-id" component="{CaseItem}" />
	<Route path="/" component="{Home}" />
	<Route path="*path" component="{Error404}" />
</Router>

<style>
</style>