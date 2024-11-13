<script>
    import { onMount } from "svelte"
    import {
        waveform, fft, 
        visualizer,
        keyDownNotes, synthVolumes, synthType,
    } from '../../oscStore.js'
    import { scale } from '$lib/funcs.js'
    import * as d3 from 'd3'

    const analysers = {
        waveform: waveform,
        fft: fft,
    }
    const analyserFuncs = {
        waveform: drawLine,
        fft: drawBins,
    }
    
    let visualWrapper
    let canvasEl
    let ctx
    let analyser = analysers[$visualizer.analyserStr]
    let binSpacer = 20
    let colorScale = d3.interpolateSpectral
    
    $: analyserValues = []
    $: interval = null
    $: timeout = null
    $: synthVolumeMult = 1 + Math.abs(1 - $synthVolumes[$synthType])

    function setCanvas() {
        ctx = canvasEl.getContext("2d")
        const { clientWidth, clientHeight } = visualWrapper
        
        canvasEl.style.width = `${clientWidth}px`
        canvasEl.style.height = `${clientHeight}px`
        
        const dpi = window.devicePixelRatio
        ctx.canvas.width = Math.floor(clientWidth * dpi)
        ctx.canvas.height = Math.floor(clientHeight * dpi)
    }
    function handleDrawInterval(arr) {
        clearTimeout(timeout)
        timeout = null
        if (arr.length) {  // notes are currently playing
            if (!interval) interval = setInterval(makeFrame, 1)
        }
        else {  // all notes have been released
            if (interval) timeout = setTimeout(stopFrame, 5000)
        }
    }
    function makeFrame() {
        analyserValues = analyser.getValue()
        analyserFuncs[analyser._type]()
    }
    function stopFrame() {
        clearInterval(interval)
        clearTimeout(timeout)
        interval = null
        timeout = null
    }
    function drawBins() {
        const { width, height } = ctx.canvas
        ctx.clearRect(0, 0, width, height)
        ctx.lineWidth = $visualizer.lineWidth

        let x, y, color, ampScaled
        for (let i = 1, len = analyserValues.length; i < len; i++) {
            const val = analyserValues[i]
            ampScaled = scale(val * synthVolumeMult, -100, -20, 1, 0)
            color = colorScale(ampScaled)
            ctx.strokeStyle = color
            ctx.beginPath()
            x = scale(i * binSpacer, 1, len, 0, width)
            y = scale(val * synthVolumeMult, -100, -20, height, 0)

            ctx.moveTo(x, height)
            ctx.lineTo(x, y)
            ctx.stroke()
        }
    }
    
    function drawLine() {
        const { width, height } = ctx.canvas
        ctx.clearRect(0, 0, width, height)
        ctx.lineJoin = "round"
        ctx.lineWidth = $visualizer.lineWidth
        
        // loop through analyserValues until you find index of a 0 point
        let start = 0
        for (let i = 1, len = analyserValues.length; i < len; i++) {
            if (analyserValues[i - 1] > 0 && analyserValues[i] <= 0) {
                start = i
                break;
            }
        }
        let end = analyserValues.length / 2 + start
        
        // start drawing from new start index
        ctx.beginPath()
        for (let i = start; i < end; i++) {
            const x = scale(i, start, end, 0, width)
            const y = scale(analyserValues[i] * synthVolumeMult, -.5, .5, 0, height)
            ctx.lineTo(x, y)
        }
        ctx.stroke()
    }
////// ------------------------------------------------------------- //
////// ----------------------- subscriptions ----------------------- //
////// ------------------------------------------------------------- //
    onMount(() => {
        keyDownNotes.subscribe(arr => {
            handleDrawInterval(arr)
        })
        visualizer.subscribe(({ analyserStr, lineWidth }) => {
            analyser = analysers[analyserStr]
        })
        setCanvas()
    })

</script>

<svelte:window on:resize={ setCanvas }></svelte:window>
<div class="visualizer-wrapper" bind:this={visualWrapper}>
    <canvas id="visualizer" bind:this={ canvasEl }>
    </canvas>
</div>

<style lang="scss">

.visualizer-wrapper {
    width: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
}
.menu-toggle {
    width: fit-content;
    margin: 30px auto;
}

// @media screen and (max-height: 650px) {
//     .visualizer-wrapper {
//         bottom: 0;
//     }
// }
    
</style>