<script>
	import { page } from '$app/stores';
	import '../app.css'
	import github from '$lib/images/github.svg'
	import ztk from '$lib/images/ztk.svg'
    import { base } from '$app/paths'
</script>

<div class="container">
	<header>
		<div class="corner">
			<a class="github" href="https://github.com/zkramer22/synthdojo" target="_blank">
				<img src={github} alt="github logo">
			</a>
		</div>
	
		<nav>
			<ul>
				<li aria-current={$page.url.pathname === `${base}/` ? 'page' : undefined}>
					<a href="{base}/">Home</a>
				</li>
				<li aria-current={$page.url.pathname === `${base}/osc` ? 'page' : undefined}>
					<a href="{base}/osc">osc</a>
				</li>
			</ul>
		</nav>
	
		<div class="corner">
			<a class="ztk" href="https://ztkweb.com" target="_blank">
				<img src={ztk} alt="ztk monogram">
			</a>
		</div>
	</header>
</div>

<style>
	header {
        position: relative;
        z-index: 10000;
		display: flex;
		justify-content: space-between;
		padding: 10px;
        /* cursor: crosshair; */
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2em;
		height: 2em;
		scale: 1;
		transition: scale .075s linear;
	}
	
	.corner a:hover {
		scale: 1.1;
	}

	.github {
		background-color: white;
		padding: 1px;
		border-radius: 50%;
	}

	.ztk {
		background-color: white;
		padding: 1px;
		border-radius: 2px;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 0.7);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
	}

	li {
		position: relative;
		height: 100%;
		transition: border-color .1s linear;
		border-bottom: 2px solid transparent;
	}

	li[aria-current='page'] {
		border-bottom: 2px solid white;
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	@media (hover:hover) {
		.corner a:hover {
			scale: 1.1;
		}
	}
</style>
