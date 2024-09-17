<script>
    import chevUp from '$lib/images/chevup.svg'
    import chevDown from '$lib/images/chevdown.svg'
    import { ripple } from 'svelte-ripple-action'

    import { defaultRipple } from '../../defaultsStore.js'
    import { 
        mouseDownNote, keyDownNotes,
        voices, baseOctave, synthType,
        attack, decay, sustain, release,
        driveWet, crushWet, reverbWet, 
    } from '../../oscStore.js'
    import { KEYCODES } from '$lib/keycodes.js'
	// import KeySettings from './KeySettings.svelte'
    
    export let keybed
    export let osc

    const natOrSharp = (note) => note[1] === '#' ? 'sharp' : 'natural'
    $: noteIsOn = (note) => note === $mouseDownNote || $keyDownNotes.includes(note) ? 'is-on' : ''
    $: settings = [
        { name: 'voices', val: $voices, ref: voices },
        { name: 'octave', val: $baseOctave, ref: baseOctave },
    ]
    $: effects = [
        { name: 'drive', val: $driveWet, ref: driveWet },
        { name: 'crush', val: $crushWet, ref: crushWet },
        { name: 'reverb', val: $reverbWet, ref: reverbWet },
    ]
    $: alerts = []
    
    function mouseEvent(note) {
        osc.noteEvent({ note, synthType: $synthType, releaseArr: [$mouseDownNote] })
        mouseDownNote.set(note)
    }
    function slideEvent(note) {
        if ($mouseDownNote && $voices === 1) {
            osc.noteEvent({ note: '', synthType: $synthType, releaseArr: [$mouseDownNote] })
            osc.noteEvent({ note, synthType: $synthType })
            mouseDownNote.set(note)
        }
    }
    function keyEvent(e, on) {
        // e.preventDefault()
        const { code, repeat } = e
        if (repeat) return
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
            osc.noteEvent({ note: '', synthType: $synthType, releaseArr: [$keyDownNotes[0]]})
        }
        if (on) { osc.noteEvent({ note, synthType: $synthType, }) }
        else { osc.noteEvent({ note: '', synthType: $synthType, releaseArr: [note] }) }
    }
    function keyControlEvent(keyCode) {
        const [control, opt] = keyCode  // "opt" is name of function
        if (control === 'octave') { 
            baseOctave[opt]() 
            osc.synth.releaseAll()
            updateKeyDownNotes({ kill: true })
        }
    }
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
    function incHandler(ref, synthType) {
        try {
            ref.inc(synthType)
        } catch (error) {
            const { message } = error.body
            alerts = [message, ...alerts]
            setTimeout(clearAlerts, 2500)
        }
    }
    function changeSynth() {
        osc.changeSynth($synthType)
        console.log($synthType);
        if ($synthType === 'pluck') { voices.mono() }
    }
    function handleEnvelopeChange() {
        osc.synth.set({
            envelope: {
                attack: $attack,
                decay: $decay,
                sustain: $sustain,
                release: $release
            }
        })
    }
    function handleEffectChange() {
        console.log('yo');
    }
    function formatTimeVal(seconds) {
        let result;
        if (seconds < 1) {
            result = (seconds * 1000).toFixed(0) + ' ms';  // Convert to milliseconds, no decimal places
        } else {
            result = seconds.toFixed(2) + ' s';  // Keep 1 decimal place for seconds
        }
        return result;
    }
    function clearAlerts() {
        console.log('clearing');
        alerts = alerts.slice(0, -1)
    }

</script>

<svelte:document 
    on:keydown={ (e) => keyEvent(e, true) }
    on:keyup={ (e) => keyEvent(e, false) }
/>

<div class="osc-wrapper">
    <div class="key-settings-wrapper">
        {#each settings as { name, val, ref } (`key-setting-${name}`)}
        <div class="key-setting">
            <div class="setting-name">
                <span>{ name }</span></div>
            <div class="setting-val">
                <div class="val-text">{ val }</div>
                <div class="val-buttons">
                    <div class="button" use:ripple={ defaultRipple } on:click={ () => incHandler(ref, $synthType) }>
                        <img src={ chevUp } alt="up"/>
                    </div>
                    <div class="button" use:ripple={ defaultRipple } on:click={ ref.dec }>
                        <img src={ chevDown } alt="down"/>
                    </div>
                </div>
            </div>
        </div>
        {/each}
        <div class="key-setting">
            <div class="setting-name">
                <span>synth</span>
            </div>
            {#if osc?.SYNTHS}
                <div class="setting-val select">
                    <select bind:value={ $synthType } on:change={ changeSynth }>
                        {#each Object.keys(osc.SYNTHS) as synth}
                            <option value={synth}>
                                { synth }
                            </option>
                        {/each}
                    </select>
                </div>
            {:else}
                <div class="setting-val select">
                    <select value={ '...' }>
                        <option>...</option>
                    </select>
                </div>
            {/if}
        </div>
    </div>

    <div class="effects-wrapper">
        {#if osc?.EFFECTS}
        <!-- {#each Object.keys(osc.EFFECTS).slice(0,-1) as effect} -->
        {#each effects as { name, val, ref }}
        <div class="envelope">
            { name }
            <input type="range" min="0" max="1" step=".01" bind:value={val} 
                on:input={ handleEffectChange }/>
            <div class="envelope-val">
                { (val * 100).toFixed() }%
            </div>
        </div>
        {/each}
        {:else}
        <div>
            ...
        </div>
        {/if}
    </div>

    <div class="keybed-wrapper" 
        on:mouseleave={ () => mouseEvent('') }
        on:mouseenter|once={ () => osc.start() }
    >
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
        <div class="envelope">
            A
            <input type="range" min="0.005" max="2" step=".001" bind:value={$attack} 
                on:input={ handleEnvelopeChange }/>
            <div class="envelope-val">
                {formatTimeVal($attack)}
            </div>
        </div>
        <div class="envelope">
            D
            <input type="range" min="0.1" max="2" step=".001" bind:value={$decay} 
                on:input={ handleEnvelopeChange }/>
            <div class="envelope-val">
                {formatTimeVal($decay)}
            </div>
        </div>
        <div class="envelope">
            S
            <input type="range" min="0" max="1" step=".01" bind:value={$sustain} 
                on:input={ handleEnvelopeChange }/>
            <div class="envelope-val">
                {($sustain * 100).toFixed()}%
            </div>
        </div>
        <div class="envelope">
            R
            <!-- <div class="range">
                <input type="range" min="0.1" max="5" step=".01" bind:value={$release} 
                    on:input={ handleEnvelopeChange }/>
            </div> -->
            <input type="range" min="0.1" max="5" step=".001" bind:value={$release} 
                on:input={ handleEnvelopeChange }/>
            <div class="envelope-val">
                {formatTimeVal($release)}
            </div>
        </div>
    </div>
</div>
    <!-- OLD <div class="envelope-wrapper" OLD >
    <div class="envelope">
        attack
        <input type="range" min="0.005" max="2" step=".001" bind:value={$attack} 
            on:input={ handleEnvelopeChange }/>
        {$attack}s
    </div>
    <div class="envelope">
        decay
        <input type="range" min="0.1" max="2" step=".01" bind:value={$decay} 
            on:input={ handleEnvelopeChange }/>
        {$decay}s
    </div>
    <div class="envelope">
        sustain
        <input type="range" min="0" max="1" step=".01" bind:value={$sustain} 
            on:input={ handleEnvelopeChange }/>
        {($sustain * 100).toFixed()}%
    </div>
    <div class="envelope">
        release
        <input type="range" min="0.1" max="5" step=".01" bind:value={$release} 
            on:input={ handleEnvelopeChange }/>
        {$release}s
    </div>
</div> -->

<style>
    .osc-wrapper {
        display: grid;
        grid-template-columns: 3fr auto 5fr;
        grid-template-rows: 140px 1fr;
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
    @media (hover:hover) {
        .note:hover {
            filter: brightness(1.3);
        }
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
    /* --------------------------------------------------------------------------- */
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
    }
    .key-setting:last-of-type {
        margin-bottom: 0;
    }
    .key-setting .button {
        width: 15px;
        padding: 5px;
        background-color: #222222;
        border: 1px solid gray;
        border-right: none;
        border-top: none;
        z-index: 1;
    }
    .key-setting .button:nth-of-type(2) {
        border-bottom: none;
    }
    @media (hover:hover) {
        .key-setting .button:hover {
            filter: brightness(1.3);
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
    }
    .val-text {
        min-width: 30px;
        margin: auto;
    }
    .setting-val select {
        height: 100%;
        padding: 0 10px;
        text-align: center;
        min-height: 30px;
        font-weight: lighter;
        font-size: 1rem;
    }
    .envelope-wrapper {
        grid-column: 3 / 4;
        grid-row: 2 / 3;
        display: flex;
        margin: auto;
    }
    .envelope {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin: 0 5px;
    }
    input[type=range] {
        writing-mode: vertical-lr;
        direction: rtl;
        vertical-align: middle;
        border: 1px solid gray;
        margin: 5px 0;
    }
    input[type="range"]::-webkit-slider-runnable-track {
        width: 100%;
    }
    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none; 
        height: 1px;
        /* background-color: royalblue; */
        border-radius: 5px;
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
        border: 1px solid gray;
    }
    .effect {
        margin-right: 10px;
    }
    .effect-name {

    }

</style>