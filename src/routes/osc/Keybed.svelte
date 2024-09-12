<script>
    import { ripple } from 'svelte-ripple-action'
    import { 
        mouseDownNote,
        voices,
    } from '../../oscStore.js'
    import { defaultRipple } from '../../defaultsStore.js'
    
    export let keybed
    export let osc

    const natOrSharp = (note) => note[1] === '#' ? 'sharp' : 'natural'

    $: noteIsOn = (note) => note === $mouseDownNote ? 'is-on' : ''
    
    function noteEvent(note) {
        osc.noteEvent(note)
        mouseDownNote.set(note)
    }

    function slideEvent(note) {
        if ($mouseDownNote && $voices === 1) {
            osc.noteEvent(note)
            mouseDownNote.set(note)
        }
    }

</script>

<div class="keybed-wrapper" 
    on:mouseleave={ () => noteEvent('') }
    on:mouseenter|once={ () => osc.start() }
>
    {#each keybed as { note, octave }, i}
        <div class={`note ${natOrSharp(note)} ${noteIsOn(`${note}${octave}`)}`}
            use:ripple={ defaultRipple }
            on:mousedown={ () => noteEvent(`${note}${octave}`) }
            on:mouseup={ () => noteEvent('') }
            on:mouseenter={ () => slideEvent(`${note}${octave}`) }
            key={`key-${i}`}
        >
            <span>{ note }{ octave }</span>
        </div>
    {/each}
</div>

<style>
    .keybed-wrapper {
        display: flex;
        margin: auto auto 15px;
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
        transition: border-color .275s linear;
    }

    .note:hover {
        filter: brightness(1.3);
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

</style>