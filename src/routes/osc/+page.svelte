<script>
	import { onMount } from 'svelte'
	import Keybed from "./Keybed.svelte"
	import { 
		baseOctave,
		synthType,
		attack,
		decay,
		sustain,
		release,
		volume,
	} from '../../oscStore.js'
	import { KEYCODES } from '$lib/keycodes.js'

	import Osc from './osc.js'
	// import KeySettings from './KeySettings.svelte'
	
	let osc
	let notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#','A', 'A#', 'B']
	let keycodes = Object.keys(KEYCODES)
	let keyNum = 17  // sets max number of keys in keybed
	$: keybed = getKeybed($baseOctave)
	
    function getKeybed(base) {  // keybed starts on F.
		let octave = base
		let keybed = []
        for (let i = 0, j = 0; i < notes.length; i++, j++) {
            const keyObj = { note: notes[i], keycode: keycodes[j], octave }
			keybed.push(keyObj)
			if (i === notes.length - 1) { 
				octave++
				i = -1
			}
			if (keybed.length === keyNum) break
        }
		return keybed
    }
	
	onMount(() => {
		osc = new Osc({
			synth: $synthType,
			envelope: {
				attack: $attack,
				decay: $decay,
				sustain: $sustain,
				release: $release,
			},
			volume: $volume,
		})
		osc.chainUp()
	})
	
</script>

<svelte:head>
	<title>synthDojo OSC</title>
	<meta name="description" content="About this app" />
</svelte:head>

<Keybed keybed={ keybed } osc={ osc } />
<!-- <KeySettings osc={ osc } /> -->

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