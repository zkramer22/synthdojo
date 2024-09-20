import { writable } from "svelte/store";

// --------- effects settings --------- //
// accepted values are from 0 to 1, unless otherwise noted //
const driveWet = writable(0)
const driveDist = writable(0) 
const driveOversample = writable('none')  // 'none', '2x', '4x' 

const chorusWet = writable(0)
const chorusDepth = writable(0)
const chorusSpread = writable(0)  // 0 to 180
// frequency: '',
// delayTime: '',
// feedback: '',

const reverbWet = writable(0)
const reverbDecay = writable(3)  // seconds
const reverbPreDelay = writable(0)  // seconds

// const pingPongWet = writable(0)

// const phaserWet = writable(0)
export default {
    driveWet,
    driveDist, 
    driveOversample,

    chorusWet,
    chorusDepth,
    chorusSpread,

    reverbWet,
    reverbDecay,
    reverbPreDelay,
}