<script lang="ts">
	import { Router, Route } from "svelte-routing";
	import Error404 from './routes/404.svelte';
	import Home from './routes/Home.svelte';
	import Case from './routes/Case.svelte';
	import CaseItem from './routes/CaseItem.svelte';


	// import { FirebaseApp, User, Doc, Collection } from 'sveltefire';
	import { FirebaseApp } from 'sveltefire';
	import firebase from 'firebase/app';
	import 'firebase/firestore';
	import 'firebase/auth';
	import 'firebase/performance';
	import 'firebase/analytics';

  let firebaseConfig = {
    apiKey: "AIzaSyBOyxjkB1FucSnUTKpVC8zm60y_BJys0cM",
    authDomain: "casebuilder-pro-3000.firebaseapp.com",
    databaseURL: "https://casebuilder-pro-3000.firebaseio.com",
    projectId: "casebuilder-pro-3000",
    storageBucket: "casebuilder-pro-3000.appspot.com",
    messagingSenderId: "792535121824",
    appId: "1:792535121824:web:fe98ec8c1d3643200d6ec5",
    measurementId: "G-K6MPQDFJ6K"
  };

	firebase.initializeApp(firebaseConfig)

	export let url = "";
</script>

<FirebaseApp {firebase}>
	<Router url="{url}">
		<Route path="case/:id" component="{Case}" />
		<Route path="case-item/:caseId" component="{CaseItem}" />

		<Route path="/" component="{Home}" />
		<Route path="*path" component="{Error404}" />
	</Router>
</FirebaseApp>

<style>
</style>