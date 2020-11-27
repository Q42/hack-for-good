<script>
	import { Router, Route } from "svelte-routing";
	import Home from './routes/Home.svelte';
	import Case from './routes/Case.svelte';

	export let url = "";
</script>

<Router url="{url}">
	<Route path="case/:id" component="{Case}" />
	<Route path="/" component="{Home}" />
</Router>

<style>
</style>