<script>
	import { onMount } from 'svelte'
	import Keybed from "./Keybed.svelte"
	import { 
		octaves,
		homeOctave,
	} from '../../oscStore.js'

	import Osc from './osc.js'
	import KeySettings from './KeySettings.svelte';
	
	let osc
	let keys = ['F', 'F#', 'G', 'G#','A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E']
	$: keybed = getKeybed($octaves)
	
    function getKeybed(octaves) {  // keybed starts on F.
		let octave = $homeOctave
		let endOctave = octave + octaves
		let keybed = []
        for (let i = 0; i < keys.length; i++) {
			if (keys[i] === 'C') { octave ++ }
            const keyObj = { note: keys[i], octave }
			keybed.push(keyObj)
			if (i === keys.length - 1 && octave !== endOctave) { i = -1 }
        }
		return keybed
    }

	onMount(() => {
		osc = new Osc()
	})
	
</script>

<svelte:head>
	<title>synthDojo OSC</title>
	<meta name="description" content="About this app" />
</svelte:head>

<Keybed keybed={ keybed } osc={ osc } />
<KeySettings osc={ osc } />

<!-- 
	visualizer canvas animation
	THREE.js
	interactive gradients

	instrument panel
	effects panels
	
	record, export panel
	audio waveform view
-->

<style>
	/* .invisible-bg {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
	} */
</style>