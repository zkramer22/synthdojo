import { error } from "@sveltejs/kit";
import { writable } from "svelte/store";
// import * as Tone from 'tone'
// --------- note banks --------- //
export const mouseDownNote = writable('')
export const keyDownNotes = writable([])

// --------- visual settings --------- //
export const keyFillColor = writable("rgba(0,0,0,0.3)")

// --------- sound settings --------- //
function createVoices(val) {
    const { subscribe, set, update } = writable(val)
    return {
        subscribe,
        inc: (synthType) => update(val => {
            if (synthType === 'pluck') {
                error('444', { message: 'you cannot increase the number of playable voices for the Pluck synth.' })
                return val
            }
            return val < 6 ? val + 1 : val
        }),
        dec: () => update(val => val > 1 ? val - 1 : val),
        mono: () => set(1),
        reset: () => set(4)
    }
}
function createBaseOctave(val) {
    const { subscribe, set, update } = writable(val)
    return {
        subscribe,
        inc: () => update(val => val < 5 ? val + 1 : val),
        dec: () => update(val => val > 1 ? val - 1 : val),
        reset: () => set(2)
    }
}

export const voices = createVoices(4)
export const baseOctave = createBaseOctave(3)

export const synthType = writable('sine')
export const attack = writable(0.005)
export const decay = writable(0.2)
export const sustain = writable(0.4)
export const release = writable(0.2)
export const volume = writable(-12)

export const driveWet = writable(.3)
export const crushWet = writable(.3)
export const reverbWet = writable(.3)