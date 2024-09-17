<script>
    import chevUp from '$lib/images/chevup.svg'
    import chevDown from '$lib/images/chevdown.svg'
    import { ripple } from 'svelte-ripple-action'
    import {
        baseOctave,
        voices,
        synthType,
        attack,
        decay,
        sustain,
        release,
    } from '../../oscStore.js'
    import { defaultRipple } from '../../defaultsStore.js'
    
    export let osc
    $: settings = [
        { name: 'voices', val: $voices, ref: voices },
        { name: 'octave', val: $baseOctave, ref: baseOctave },
    ]

    function changeSynth() {
        osc.changeSynth($synthType)
        if ($synthType === 'pluck') { voices.mono() }
    }
    function incHandler(ref, name) {
        if (name === 'voices' && $synthType === 'pluck') return
        ref.inc()
    }
    function decHandler(ref, name) {
        if (name === 'voices' && $synthType === 'pluck') return
        ref.dec()
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

</script>

<div class="key-settings-wrapper">
    {#each settings as { name, val, ref } (`key-setting-${name}`)}
    <div class="key-setting">
        <div class="setting-name">
            <span>{ name }</span></div>
        <div class="setting-val">
            <div class="val-text">{ val }</div>
            <div class="val-buttons">
                <div class="button"
                    use:ripple={ defaultRipple } on:click={ () => incHandler(ref, name) }>
                    <img src={ chevUp } alt="up"/>
                </div>
                <div class="button"
                    use:ripple={ defaultRipple } on:click={ () => decHandler(ref, name) }>
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
    <div class="envelope-wrapper">
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
    </div>
</div>

<style>
    .key-settings-wrapper {
        display: flex;
        align-items: center;
        width: 100%;
        /* height: 4em; */
        margin: 10px auto;
        padding: 0 10px;
        /* background-color: #222222; */
        border-radius: 5px;
        /* border-color: #4a4a4a; */
        /* border: 1px solid; */
    }
    .key-setting {
        height: 100%;
        text-align: center;
        position: relative;
        margin-right: 15px;
        /* min-width: 80px; */
    }
    .key-setting .button {
        width: 30px;
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
        height: 30%;
    }
    .setting-val {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid gray;
        width: 100%;
        height: 70%;
    }
    .val-text {
        min-width: 30px;
        padding: 5px;
    }
    .setting-val select {
        height: 100%;
        padding: 0 10px;
    }
    .envelope-wrapper {
        display: flex;
    }
    .envelope {
        /* display: flex; */
    }
</style>