<script>
	import Header from './Header.svelte';
	import "svelte-ripple-action/ripple.css"
</script>

<div id="app">
	<Header />

	<slot />
</div>

<style>
	#app {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}
</style>
