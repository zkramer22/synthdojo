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
		max-width: 69rem;
		margin: 0 auto;
	}
	
	/* footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	} */
</style>
