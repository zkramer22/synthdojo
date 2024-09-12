<script>
    import chevUp from '$lib/images/chevup.svg'
    import chevDown from '$lib/images/chevdown.svg'
    import { ripple } from 'svelte-ripple-action'
    import {
        homeOctave,
        octaves,
        voices,
    } from '../../oscStore.js'
    import { defaultRipple } from '../../defaultsStore.js'

    
    export let osc

    function incVoices() {
        if ($voices < 8) { voices.set($voices + 1) }
    }
    function decVoices() {
        if ($voices > 1) { voices.set($voices - 1) }
    }

</script>

<div class="key-settings-wrapper">
    <div class="key-setting">
        <div class="setting-name">
            <span>voices</span></div>
        <div class="setting-val">
            <span class="val-text">{ $voices }</span>
            <div class="val-buttons">
                <button use:ripple={ defaultRipple } class="inc" on:click={ incVoices }><img src={ chevUp } alt="up"/></button>
                <button use:ripple={ defaultRipple } class="dec" on:click={ decVoices }><img src={ chevDown } alt="up"/></button>
            </div>
        </div>
    </div>
</div>

<style>
    .key-settings-wrapper {
        display: flex;
        align-items: center;
        width: 100%;
        height: 3em;
        margin: 10px auto;
        padding: 0 10px;
        background-color: #222222;
        /* border: 1px solid; */
        border-radius: 5px;
        border-color: #4a4a4a;
    }
    .key-setting {
        /* display: flex; */
        text-align: center;
        position: relative;
    }
    .key-setting button {
        width: 30px;
        padding: 5px;
    }
    .setting-val {
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid gray;
    }
    .val-text {
        min-width: 40px;
    }
    .inc {

    }
    .dec {

    }
</style>