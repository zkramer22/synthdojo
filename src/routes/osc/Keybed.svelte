<script>
    import chevleft from '$lib/images/chevleft.svg'
    import chevright from '$lib/images/chevright.svg'
    import { ripple } from 'svelte-ripple-action'
    import Knob from '@bismuthsoft/svelte-dj-knob'
    import { onMount } from 'svelte'

    import { KEYCODES, FORBIDDEN } from '$lib/keycodes.js'
    import { defaultRipple, defaultEfxKnob, } from '../../defaultsStore.js'
    import { 
        mouseDownNote, keyDownNotes,
        voices, baseOctave, synthType,
        volume, envelope, synths, effects, osc,
    } from '../../oscStore.js'
	import Page from './+page.svelte';

    export let keybed
    
	let notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#','A', 'A#', 'B']
	let keycodes = Object.keys(KEYCODES)
	let keyNum = 17  // sets max number of keys in keybed
	$: keybed = getKeybed($baseOctave)
    const natOrSharp = (note) => note[1] === '#' ? 'sharp' : 'natural'
    $: noteIsOn = (note) => note === $mouseDownNote || $keyDownNotes.includes(note) ? 'is-on' : ''
    $: alerts = []
    const efxKnobs = {
        drive: [
            { param: 'wet', display: '%', ...$defaultEfxKnob },
            { param: 'distortion', display: 'tone', ...$defaultEfxKnob },
            { param: 'oversample', display: 'ovr', min: 0, max: 2, step: 1, values: ['none', '2x', '4x'] },
        ],
        reverb: [
            { param: 'wet', display: '%', ...$defaultEfxKnob },
            { param: 'decay', min: .01, max: 10, step: .01 },
            { param: 'preDelay', display: 'pre', min: .01, max: .5, step: .01 },
        ],
    }
    $: settings = [
        { setting: 'voices', store: voices, storeVal: $voices, min: 1, max: 6 },
        { setting: 'octave', store: baseOctave, storeVal: $baseOctave, min: 1, max: 5 },
    ]

////// ------------------------------------------------------------- //
////// ----------------------- ui functions ------------------------ //
////// ------------------------------------------------------------- //
    function updateKeyDownNotes({ noteStr, on, kill }) {
        keyDownNotes.update(val => {
            if (kill) { return [] }
            let result = [...val]
            if (on) { 
                if ($keyDownNotes.length === $voices) { result.shift() }
                result.push(noteStr) 
            }
            else { 
                if (result.indexOf(noteStr) !== -1) {
                    result.splice(result.indexOf(noteStr), 1)
                }
            }
            return result
        })
    }
    function formatTimeVal(seconds) {
        let result;
        if (seconds < 1) { result = (seconds * 1000).toFixed(0) + ' ms' } 
        else { result = seconds.toFixed(2) + ' s' }
        return result;
    }
    function clearAlerts() {
        console.log('clearing');
        alerts = alerts.slice(0, -1)
    }
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
////// ------------------------------------------------------------- //
////// ----------------------- osc functions ----------------------- //
////// ------------------------------------------------------------- //
    function noteEvent({ note, releaseArr }) {
        if (note) {  // note on
            $osc.triggerAttack(note) 
        }
        else {  // note off
            if ($osc.name === 'PluckSynth') return
            else { $osc.triggerRelease(releaseArr) }
        }
    }
    function mouseEvent(note) {
        noteEvent({ note, releaseArr: [$mouseDownNote] })
        mouseDownNote.set(note)
    }
    function slideEvent(note) {
        if ($mouseDownNote && $voices === 1) {
            noteEvent({ note: '', releaseArr: [$mouseDownNote] })
            noteEvent({ note })
            mouseDownNote.set(note)
        }
    }
    function keyEvent(e, on) {
        // e.preventDefault()  // maybe do this and handle all keyboard inputs manually. maybe not
        const { code, repeat, metaKey } = e
        if (repeat) return
        if (metaKey && $synthType !== 'pluck') {
            $osc.releaseAll()
            updateKeyDownNotes({ kill: true })
            return
        }
        if (KEYCODES[code] === undefined) return
        const keyCode = KEYCODES[code]
        if (typeof(keyCode) !== 'number') {
            if (!on) return
            keyControlEvent(keyCode)
            return
        }
        const { note, octave } = keybed[keyCode]
        const noteStr = `${note}${octave}`
        keyNoteEvent(noteStr, on)
        updateKeyDownNotes({ noteStr, on })
    }
    function keyNoteEvent(note, on) {
        if ($keyDownNotes.length === $voices && on) {  // voices are filled, remove the first pressed
            noteEvent({ note: '', releaseArr: [$keyDownNotes[0]]})
        }
        if (on) { noteEvent({ note }) }
        else { noteEvent({ note: '', releaseArr: [note] }) }
    }
    function keyControlEvent(keyCode) {
        const [control, opt] = keyCode  // "opt" is name of function
        if (control === 'octave') { baseOctave[opt]() }
    }
    function handleEffectChange({ e, effectName, param }) {        

    }
    function handleSettingChange(e, store, storeVal) {

    }
////// ------------------------------------------------------------- //
////// ----------------------- subscriptions ----------------------- //
////// ------------------------------------------------------------- //
    onMount(() => {
        baseOctave.subscribe(() => {
            $osc.releaseAll()
            updateKeyDownNotes({ kill: true })
        })
        synthType.subscribe((synthType) => {
            if (synthType === 'pluck') voices.mono()
        })
    })
</script>

<svelte:document on:keydown={ (e) => keyEvent(e, true) } on:keyup={ (e) => keyEvent(e, false) } />

<div class="osc-wrapper">
    <div class="key-settings-wrapper">
        {#each settings as { setting, min, max, store, storeVal } }
        <div class="key-setting">
            <div class="setting-name">
                <span>{ setting }</span></div>
            <div class="setting-val">
                <div class="button" use:ripple={ defaultRipple } on:click={ store.dec }>
                    <img src={chevleft} alt="down" />
                </div>
                <input type="number" min={min} max={max} bind:value={storeVal} on:input={ store.set(storeVal) } />
                <div class="button" use:ripple={ defaultRipple } on:click={ store.inc }>
                    <img src={chevright} alt="up" />
                </div>
            </div>
        </div>
        {/each}
        <div class="key-setting">
            <div class="setting-name">
                <span>synth</span>
            </div>
            <div class="setting-val select">
                <select bind:value={ $synthType } on:keydown={ (e) => e.preventDefault() }>
                    {#each Object.keys($synths) as synthOption}
                        <option value={synthOption}>
                            { synthOption }
                        </option>
                    {/each}
                </select>
            </div>
        </div>
    </div>

    <div class="effects-wrapper">
        {#each Object.keys(efxKnobs) as effectName}
            <div class="effect">
                <div class="effect-name">{ effectName }</div>
                <div class="effect-params flex centered">
                    {#each efxKnobs[effectName] as { param, display, min, max, step, values } }
                        <div class="effect-knob-wrapper">
                            <div class="effect-knob-name">
                                { display || param }
                            </div>
                            {#if values}
                                <div class="param-values-wrapper flex align-center">
                                    {#each values as value, i}
                                        <div class="param-value">{ value }</div>
                                    {/each}
                                </div>
                            {:else}
                                <!-- only 'wet' values in a Tone.Effect object satisfy the following condition  -->
                                {#if typeof($effects[effectName][param].value) === 'number' }
                                    <div class="effect-knob">
                                        <Knob bind:value={$effects[effectName][param].value} min={min} max={max} step={step}
                                            size="3rem" strokeWidth="{5}" 
                                            textColor="white" bgColor="#333333" valueColor="pink"
                                        />
                                    </div>
                                {:else}
                                    <div class="effect-knob">
                                        <Knob bind:value={$effects[effectName][param]} min={min} max={max} step={step}
                                            size="3rem" strokeWidth="{5}" 
                                            textColor="white" bgColor="#333333" valueColor="pink"
                                        />
                                    </div>
                                {/if}
                            

                                <!-- only 'wet' values in a Tone.Effect object satisfy the following condition  -->
                                <!-- {#if typeof($effects[effectName][param].value) === 'number' } 
                                    <input type="range" min={min} max={max} step={step} bind:value={$effects[effectName][param].value} />
                                {:else}
                                    <input type="range" min={min} max={max} step={step} bind:value={$effects[effectName][param]} />
                                {/if} -->

                            {/if}
                            </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>

    <div class="keybed-wrapper" on:mouseleave={ () => mouseEvent('') }>
        {#each keybed as { note, keycode, octave }, i}
            <!-- use:ripple={ defaultRipple } -->
            <div class={`note ${natOrSharp(note)} ${noteIsOn(`${note}${octave}`)}`}
                on:mousedown={ () => mouseEvent(`${note}${octave}`) }
                on:mouseup={ () => mouseEvent('') }
                on:mouseenter={ () => slideEvent(`${note}${octave}`) }
                key={`key-${i}`}
            >
                <div>
                    <div class="keyboard-key">{ keycode === 'Semicolon' ? ';' : keycode[keycode.length - 1] }</div>
                    <div class="note-name">{ note }{ octave }</div>
                </div>
            </div>
        {/each}
    </div>

    <div class="envelope-wrapper">
        <div class="input-range-wrapper">
            A
            <input type="range" min=".005" max="2" step=".001" bind:value={$envelope.attack} />
            <div class="envelope-val">
                {formatTimeVal($envelope.attack)}
            </div>
        </div>
        <div class="input-range-wrapper">
            D
            <input type="range" min=".05" max="2" step=".001" bind:value={$envelope.decay} />
            <div class="envelope-val">
                {formatTimeVal($envelope.decay)}
            </div>
        </div>
        <div class="input-range-wrapper">
            S
            <input type="range" min="0" max="1" step=".01" bind:value={$envelope.sustain} />
            <div class="envelope-val">
                {($envelope.sustain * 100).toFixed()}%
            </div>
        </div>
        <div class="input-range-wrapper">
            R
            <input type="range" min=".01" max="5" step=".001" bind:value={$envelope.release} />
            <div class="envelope-val">
                {formatTimeVal($envelope.release)}
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    .osc-wrapper {
        display: grid;
        grid-template-columns: 3fr auto 5fr;
        grid-template-rows: auto 1fr;
        grid-gap: 10px;
        width: 100%;
        margin: auto auto 15px;
        position: relative;
    }
    .keybed-wrapper {
        grid-column: 2 / 3;
        grid-row: 2 / 3;
        display: flex;
        margin: auto auto;
        overflow: hidden;
        border: 1px solid #4a4a4a;
        border-radius: 5px;
        -webkit-user-drag: none;
        user-select: none;
        box-shadow: 0px 5px 2px 4px #141414;
    }
    .note {
        border: 1px solid #4a4a4a;
        position: relative;
        display: flex;
        align-items: flex-end;
        transition: border-color .1s linear;
    } 
    .sharp {
        width: 40px;
        margin: 0 -22px 0 -22px;
        height: 130px;
        background-color: royalblue;
        z-index: 20;
        padding: 0 0 0 2px;
    }
    .natural {
        width: 65px;
        height: 200px;
        background-color: #222222;
        z-index: 10;
        padding: 0 0 0 3px;
    }
    .is-on {
        border-color: white;
    }
    .keyboard-key {
        text-align: center;
        border: 1px solid;
        background-color: lightgray;
        color: #222222;
        width: 20px;
        border-radius: 2px;
        opacity: 0;
    }
    .key-settings-wrapper {
        grid-column: 1 / 2;
        grid-row: 2 / 3;
        margin: auto;
        padding: 0 10px;
        border-radius: 5px;
    }
    .key-setting {
        text-align: center;
        position: relative;
        margin-bottom: 7px;
        &:last-of-type {
            margin-bottom: 0;
        }
        .button {
            width: 25%;
            height: 100%;
            align-content: center;
            img {
                height: 60%;
            }
        }
    }
    .setting-name {
        margin-bottom: 5px;
    }
    .setting-val {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid gray;
        height: 30px;
        padding: 0;
        select {
            height: 100%;
            padding: 0 5px;
            text-align: center;
            font-weight: lighter;
            font-size: 1rem;
        }
        &:has(>input:focus) {
            border-color: white;
        }
    }
    .val-text {
        min-width: 30px;
        margin: auto;
    }
    .param-values-wrapper {
        .param-value {
            border: 1px solid gray;
            padding: 4px 7px;
            margin-right: 5px;
        }
    }

    input[type=number] {
        -webkit-appearance: textfield;
        -moz-appearance: textfield;
        appearance: textfield;
        cursor: pointer;
        position: relative;
        width: auto;
        height: 100%;
        text-align: center;
        border: none;
        padding: 0;
        color: white;
        caret-color: transparent;
        &::-webkit-inner-spin-button, &::-webkit-outer-spin-button {
            -webkit-appearance: none;
        }
    }

    input[type=range] {
        border: 1px solid gray;
        &::-webkit-slider-runnable-track {
            width: 100%;
        }
        &::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none; 
            border-radius: 5px;
        }
    }
    
    .envelope-wrapper {
        grid-column: 3 / 4;
        grid-row: 2 / 3;
        display: flex;
        margin: auto;
        .input-range-wrapper {
            flex-direction: column;
            align-items: center;
            text-align: center;
            margin: 0 5px;
            input[type=range] {
                writing-mode: vertical-lr;
                direction: rtl;
                vertical-align: middle;
                margin: 5px 0;
                &::-webkit-slider-thumb {
                    height: 1px;
                    width: 100%;
                    background-color: lightgreen;
                    box-shadow: 0px 400px 0px 400px lightgreen;
                }
            }
        }
    }
    .input-range-wrapper {
        display: flex;
    }
    .envelope-val {
        border: 1px solid gray;
        font-size: .8rem;
        width: 41px;
        text-align: center;
        padding: 2px;
    }
    .effects-wrapper {
        grid-column: 2 / 2;
        grid-row: 1 / 2;
        display: flex;
        width: 100%;
        height: 100%;
        border-radius: 5px;
        .input-range-wrapper {
            input[type=range] {
                &::-webkit-slider-thumb {
                    width: 1px;
                    height: 100%;
                    background-color: lightgreen;
                    box-shadow: -400px 0px 0px 400px lightgreen;
                }
            }
        }
    }
    .effect {
        text-align: center;
        margin-right: 10px;
    }
    .effect-knob-wrapper {
        margin-right: 10px;
    }

    @media (hover:hover) {
        .note:hover,
        .key-setting .button:hover,
        select:hover {
            filter: brightness(1.3);
        }
	} 

</style>