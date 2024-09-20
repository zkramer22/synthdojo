import { writable, derived, get } from "svelte/store";
// import { error } from "@sveltejs/kit";
import * as Tone from 'tone'

// --------- note banks --------- //
export const mouseDownNote = writable('')
export const keyDownNotes = writable([])

// --------- visual settings --------- //
export const keyFillColor = writable("rgba(0,0,0,0.3)")

// --------- synth settings --------- //
function createBaseOctave(val) {
    const { subscribe, set, update } = writable(val)
    return {
        subscribe, set,
        inc: () => update(val => val < 5 ? val + 1 : val),
        dec: () => update(val => val > 1 ? val - 1 : val),
        reset: () => set(3)
    }
}

function createVoices(val) {
    const { set, update, subscribe } = writable(val)
    return {
        subscribe, set,
        inc: () => update(val => {
            if (get(synthType) === 'pluck') return val
            return val < 6 ? val + 1 : val
        }),
        dec: () => update(val => val > 1 ? val - 1 : val),
        mono: () => set(1),
        reset: () => set(4),
    }
}

export const voices = createVoices(4)
export const baseOctave = createBaseOctave(3)
export const synthType = writable('sine')
export const volume = writable(-12)
export const envelope = writable({
    attack: 0.005,
    decay: 0.2,
    sustain: 0.5,
    release: 0.1,
})
export const synths = writable({
    sine: new Tone.PolySynth(Tone.Synth).set({ oscillator: { type: 'sine' }}),
    saw: new Tone.PolySynth(Tone.Synth).set({ oscillator: { type: 'sawtooth' }}),
    triangle: new Tone.PolySynth(Tone.Synth).set({ oscillator: { type: 'triangle' }}),
    square: new Tone.PolySynth(Tone.Synth).set({ oscillator: { type: 'square' }}),
    pluck: new Tone.PluckSynth({ resonance: .955 }),
    fm: new Tone.PolySynth(Tone.FMSynth),
    am: new Tone.PolySynth(Tone.AMSynth),
})
export const effects = writable({
    // accepted param values are from 0 to 1, unless otherwise noted //
    drive: new Tone.Distortion({
        wet: 0, 
        distortion: .5,
        oversample: 'none',  // 'none', '2x', '4x' 
    }),
    reverb: new Tone.Reverb({
        wet: 0,
        decay: 3,  // seconds
        preDelay: .01,  // seconds
    }),
    compressor: new Tone.Compressor({
        wet: 1,
        threshold: -6,  // decibels [-Infinity, 0]
        attack: .02,  // seconds
        knee: 12,  // decibels [0, max 20?]
        release: .3,  // seconds
        ratio: 20,  // [1, 20]
    }).toDestination()
})

// effects.subscribe((effects) => {
//     console.log('effects update: ', effects);
// })

export const synth = derived(
    [synths, synthType], 
    ([$synths, $synthType], set) => {
        set($synths[$synthType])
    },
)
export const osc = derived(
    [synth, effects, envelope, volume],
    ([$synth, $effects, $envelope, $volume], set) => {
        const efx = Object.values($effects)
        set($synth
            .set({ envelope: $envelope, volume: $volume})
            .chain(...efx))
    }
)


// osc.subscribe((osc) => {
//     console.log('osc update: ', osc);
// })