<script>
    import chevleft from '$lib/images/chevleft.svg'
    import chevright from '$lib/images/chevright.svg'
    import bars from '$lib/images/bars.svg'
    import wave from '$lib/images/wave.svg'
    import { ripple } from 'svelte-ripple-action'
    import Knob from '$lib/components/Knob.svelte'
    import { onMount } from 'svelte'
    import { KEYCODES } from '$lib/keycodes.js'
    import { scale } from '$lib/funcs.js'

    import { defaultRipple, defaultFxKnob, } from '../../defaultsStore.js'
    import { 
        mouseDownNote, keyDownNotes,
        voices, baseOctave, synthType, synthVolumes,
        volume, userVolume, envelope, synths, effects, osc,
        visualizer,
    } from '../../oscStore.js'
    
	const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#','A', 'A#', 'B']
	const keycodes = Object.keys(KEYCODES)
	const keyNum = 17  // sets max number of keys in keybed
    const natOrSharp = (note) => note[1] === '#' ? 'sharp' : 'natural'
    const fxKnobs = {
        drive: [
            { display: '%', param: 'wet', fxType: 'normal', ...$defaultFxKnob },
            { display: 'tone', param: 'distortion', ...$defaultFxKnob },
        ],
        reverb: [
            { display: '%', param: 'wet', fxType: 'normal', ...$defaultFxKnob },
            { param: 'decay', fxType: 'time', min: .01, max: 10, step: .01 },
            { display: 'pre', param: 'preDelay', fxType: 'time', min: .01, max: .5, step: .01 },
        ],
        delay: [
            { display: '%', param: 'wet', fxType: 'normal', ...$defaultFxKnob },
            { display: 'time', param: 'delayTime', fxType: 'time', min: .01, max: 3, step: .01 },
            { display: 'feedback', param: 'feedback', ...$defaultFxKnob },
        ],
    }
    const envKnobs = [
        { display: 'A', param: 'attack', fxType: 'time', min: .005, max: 2, step: .001 },
        { display: 'D', param: 'decay', fxType: 'time', min: .05, max: 2, step: .001 },
        { display: 'S', param: 'sustain', fxType: 'normal', min: 0, max: 1, step: .01 },
        { display: 'R', param: 'release', fxType: 'time', min: .01, max: 5, step: .001 },
    ]
    const vizKnobs = [
        { display: 'type', param: 'analyserStr', values: [{ name: 'fft', img: bars }, { name: 'waveform', img: wave }] },
        { display: 'line width', param: 'lineWidth', min: 1, max: 10, step: .1, fxType: 'decibel' }
    ]

    let meterWrapper = undefined
    let meterEl = undefined

    $: meterVal = null
	$: keybed = getKeybed($baseOctave)
    $: noteIsOn = (note) => note === $mouseDownNote || $keyDownNotes.includes(note) ? 'is-on' : ''
    $: alerts = []
    $: menus = {
        fx: false,
        env: false,
    }
    $: menuIsOpen = (menu) => menus[menu] ? 'open' : ''
    $: settings = [
        { setting: 'voices', store: voices, storeVal: $voices, min: 1, max: 6 },
        { setting: 'octave', store: baseOctave, storeVal: $baseOctave, min: 1, max: 5 },
    ]
    $: vizIsActive = (name) => name === $visualizer.analyserStr ? 'active' : ''

 
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
    function clearAlerts() {
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
        // e.preventDefault()  // do this later and handle all keyboard inputs manually
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
    function setMeter() {

    }
    function setVolume(vol) {
        if (vol === 0) volume.set(-Infinity)
        else {
            volume.set(Number((
                scale(vol * $synthVolumes[$synthType], 1, 100, -60, -6)
            ).toFixed()))
        }
    }
    function menuButton(menu) {
        if (menus[menu]) menus[menu] = false
        else {
            Object.keys(menus).forEach(key => menus[key] = false)
            menus[menu] = true
        }
    }
    function changeAnalyser(name) {
        visualizer.set({
            lineWidth: $visualizer.lineWidth,
            analyserStr: name 
        })
    }
////// ------------------------------------------------------------- //
////// ----------------------- subscriptions ----------------------- //
////// ------------------------------------------------------------- //
    onMount(() => {
        baseOctave.subscribe(() => {
            if (keyDownNotes) {
                if ($synthType !== 'pluck') $osc.releaseAll()
                updateKeyDownNotes({ kill: true })
            }
        })
        synthType.subscribe(synthType => {
            if (synthType === 'pluck') voices.mono()
            setVolume($userVolume)
        })
        userVolume.subscribe(userVolume => {
            setVolume(userVolume)
        })
        setMeter()
    })

</script>

<svelte:document on:keydown={ (e) => keyEvent(e, true) } on:keyup={ (e) => keyEvent(e, false) } />
    
<div class="osc-wrapper container">
    <div class="volume-wrapper">
        <div class="effect-knob-wrapper">
            <div class="effect-name text-center">
                volume
            </div>
            <div class="effect-knob">
                <Knob bind:value={$userVolume} min={0} max={100} step={1} fxType="decibel"
                    size={60} textColor="white" bgColor="#333333" color="#ffbde1" />
            </div>
        </div>
    </div>
    
    <div class="key-settings-wrapper">
        <div class="key-setting">
            <div class="setting-name">
                <span>synth</span>
            </div>
            <div class="setting-val select">
                <select class="hover-bright" bind:value={ $synthType } on:keydown|preventDefault>
                    {#each Object.keys($synths) as synthOption}
                        <option value={synthOption}>
                            { synthOption }
                        </option>
                    {/each}
                </select>
            </div>
        </div>
        {#each settings as { setting, min, max, store, storeVal } }
        <div class="key-setting">
            <div class="setting-name">
                <span>{ setting }</span></div>
            <div class="setting-val">
                <div class="button hover-bright" use:ripple={ defaultRipple } on:click={ store.dec }>
                    <img src={chevleft} alt="down" />
                </div>
                <input type="number" min={min} max={max} bind:value={storeVal} on:input={ store.set(storeVal) } />
                <div class="button" use:ripple={ defaultRipple } on:click={ store.inc }>
                    <img src={chevright} alt="up" />
                </div>
            </div>
        </div>
        {/each}
    </div>

    <div class="menus-wrapper">
        <div class={`menu-toggle hover-bright ${menuIsOpen('fx')}`} on:click={ () => menuButton('fx')}>FX</div>
        <div class={`menu-toggle hover-bright ${menuIsOpen('env')}`} on:click={ () => menuButton('env') }>envelope</div>
        <div class={`menu-toggle hover-bright ${menuIsOpen('viz')}`} on:click={ () => menuButton('viz') }>visuals</div>
    </div>
    
    <div class={`effects-wrapper menu ${menuIsOpen('fx')}`}>
        {#each Object.keys(fxKnobs) as effectName}
            <div class="effect">
                <div class="effect-name border">{ effectName }</div>
                <div class="effect-params flex centered">
                    {#each fxKnobs[effectName] as { param, display, min, max, step, values, fxType } }
                        <div class="effect-knob-wrapper">
                            <div class="effect-knob-name">
                                { display || param }
                            </div>
                            {#if values}
                                <select size={values.length} bind:value={$effects[effectName][param]} class="param-values-wrapper">
                                    {#each values as value, i}
                                        <option class="param-value">{ value }</option>
                                    {/each}
                                </select>
                            {:else}
                                <!-- only 'wet' param in Tone.Effect satisfies the following condition  -->
                                {#if fxType === 'normal' || typeof($effects[effectName][param].value) === 'number' }
                                    <div class="effect-knob">
                                        <Knob bind:value={$effects[effectName][param].value} min={min} max={max} step={step} fxType={fxType}
                                            size={60} textColor="white" bgColor="#333333" color="#ffffaf" />
                                    </div>
                                {:else}
                                    <!-- all other Tone.Effect params  -->
                                    <div class="effect-knob">
                                        <Knob bind:value={$effects[effectName][param]} min={min} max={max} step={step} fxType={fxType}
                                            size={60} textColor="white" bgColor="#333333" color="#ffffaf" />
                                    </div>
                                {/if}
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>

    <div class={`envelope-wrapper menu ${menuIsOpen('env')}`}>
        <div class="effect">
            <div class="effect-name border">envelope</div>
            <div class="effect-params flex centered">
                {#each envKnobs as { display, param, fxType, min, max, step }}
                <div class="effect-knob-wrapper">
                    <div class="effect-knob-name text-center">
                        { display }
                    </div>
                    <div class="effect-knob">
                        <Knob bind:value={$envelope[param]} min={min} max={max} step={step} fxType={fxType}
                            size={60} textColor="white" bgColor="#333333" color="#90ee90" />
                    </div>
                </div>
                {/each}
            </div>
        </div>
    </div>

    <div class={`visualizer-settings menu ${menuIsOpen('viz')}`}>
        <div class="effect">
            <div class="effect-name border">visuals</div>
            <div class="effect-params flex centered">
                {#each vizKnobs as { display, param, fxType, min, max, step, values }}
                <div class="effect-knob-wrapper">
                    <div class="effect-knob-name text-center">
                        { display }
                    </div>
                    {#if values}
                    <div class="flex centered" style:height={'60px'}>
                        {#each values as { name, img }}
                        <div class={`img-button ${vizIsActive(name)}`} on:click={ () => changeAnalyser(name) }>
                            <img src={img} alt="down" />
                        </div>
                        {/each}
                    </div>
                    {:else}
                    <div class="effect-knob">
                        <Knob bind:value={$visualizer[param]} min={min} max={max} step={step} fxType={fxType}
                            size={60} textColor="white" bgColor="#333333" color="#ffffff" />
                    </div>
                    {/if}
                </div>
                {/each}
            </div>
        </div>
    </div>

    <div class="keybed-wrapper" on:mouseleave={ () => mouseEvent('') }>
        {#each keybed as { note, keycode, octave }, i}
            <!-- use:ripple={ defaultRipple } -->
            <div class={`note hover-bright ${natOrSharp(note)} ${noteIsOn(`${note}${octave}`)}`}
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

    <!-- ENVELOPE w/ SLIDERS -->
    <!-- <div class={`envelope-wrapper menu ${menuIsOpen('env')}`}>
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
    </div> -->
</div>

<style lang="scss">
    .osc-wrapper {
        display: grid;
        grid-template-columns: 1fr 100px auto 1fr;
        grid-template-rows: auto 220px;
        grid-template-rows: auto 1fr;
        grid-gap: 5px;
        width: 100%;
        position: absolute;
        bottom: 10px;
        left: 0;
        right: 0;
    }
    .keybed-wrapper {
        // grid-column: 2 / 3;
        grid-column: 3 / 4;
        grid-row: 2 / 3;
        display: flex;
        margin: auto auto;
        overflow: hidden;
        border: 1px solid #4a4a4a;
        border-radius: 5px;
        -webkit-user-drag: none;
        user-select: none;
        box-shadow: 0px 5px 1px 0px #141414;
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
        // grid-column: 1 / 2;
        grid-column: 2 / 3;
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
        &.visual {
            height: 60px;
            display: flex;
            align-items: center;
        }
        .button {
            cursor: pointer;
            width: 50%;
            height: 100%;
            align-content: center;
            padding: 0 5px;
            img {
                height: 60%;
            }
        }
    }
    .setting-name {
        margin-bottom: 5px;
        font-size: .9rem;
    }
    .setting-val {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid gray;
        height: 30px;
        padding: 0;
        font-size: .9rem;
        select {
            height: 100%;
            padding: 0 5px;
            text-align: center;
            font-weight: lighter;
            cursor: pointer;
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
        text-align: center;
        margin: 3px;
        .param-value {
            border: 1px solid gray;
            font-size: .8rem;
        }
    }
    input[type=number] {
        // width: auto;
        width: 100%;
        height: 100%;
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
        grid-row: 1 / 2;
        display: flex;
        align-items: end;
        bottom: -150px;
        &.open {
            bottom: 0px;
        }
        .input-range-wrapper {
            flex-direction: column;
            align-items: center;
            text-align: center;
            margin: 0 5px;
            input[type=range] {
                // width: 80%;
                writing-mode: vertical-lr;
                direction: rtl;
                vertical-align: middle;
                margin: 5px 0;
                &::-webkit-slider-thumb {
                    height: 1px;
                    width: 100%;
                    background-color: #90ee90;
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
        grid-column: 3 / 4;
        grid-row: 1 / 2;
        display: flex;
        width: 100%;
        height: 100%;
        bottom: -150px;
        border-radius: 5px;
        padding: 0 10px;
        &.open {
            bottom: 0px;
        }
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
        // margin-right: 10px;
        margin: 3px;
    }
    .effect-name {
        padding: 3px;
        &.border {
            border: 1px solid gray;
            border-radius: 5px 5px 0 0;
            border-bottom: 0px;
        }
    }
    .effect-knob-wrapper {
        margin: 3px;
    }
    .effect-knob-name {
        font-size: .75rem;
    }
    .knob-circle {
        width: 20px;
        height: 20px;
    }
    .menus-wrapper {
        grid-column: 3 / 4;
        // grid-row: 1 / 2;
        grid-row: 3 / 4;
        display: flex;
        align-items: end;
        // justify-content: end;
    }
    .menu-toggle {
        cursor: pointer;
        z-index: 10;
        padding: 3px 10px;
        margin-right: 7px;
        border-radius: 5px;
        text-align: center;
        width: fit-content;
        background-color: #333333;
        border: 1px solid transparent;
        &.open {
            border: 1px solid #ffffaf;
        }
    }
    .menu {
        transition: left .2s ease, bottom .2s ease, top .2s ease, right .2s ease;
        position: relative;
    }
    .volume-wrapper {
        grid-column: 2 / 3;
        grid-row: 1 / 2;
        display: flex;
        justify-content: center;
        align-items: end;
    }
    .visualizer-settings {
        grid-column: 3 / 4;
        grid-row: 1 / 2;
        display: flex;
        align-items: end;
        bottom: -150px;
        &.open {
            bottom: 0px;
        }
        .effect-knob-wrapper {
            flex-grow: 1;
        }
        .img-button {
            box-sizing: border-box;
            width: 45px;
            height: 45px;
            height: auto;
            padding: 5px;
            background-color: #333333;
            border: 1px solid transparent;
            // transition: background-color .1s linear, border-color .1s linear;
            border-radius: 3px;
            margin: 3px;
            &.active {
                background-color: #444444;
                // border-color: #ffffaf;
                border-color: gray;
            }
        }
    }

    @media (hover:hover) {
        .hover-bright:hover {
            filter: brightness(1.3);
        }
	} 

</style>