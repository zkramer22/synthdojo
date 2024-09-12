import * as Tone from 'tone'

class Osc {
    constructor() {
        this.instrument = new Tone.Synth().toDestination()
    }

    start() {
        Tone.start()
    }

    noteEvent(note) {
        if (note) { this.instrument.triggerAttack(note) }
        else { this.instrument.triggerRelease() }
    }
}

export default Osc


// export const INSTRUMENTS = {
//     "sine"      : new Tone.PolySynth(8, Tone.Synth).set({ oscillator: { type: 'sine' } }),
//     "triangle"  : new Tone.PolySynth(8, Tone.Synth).set({ oscillator: { type: 'triangle' } }),
//     "square"    : new Tone.PolySynth(8, Tone.Synth).set({ oscillator: { type: 'square' } }),
//     "membrane"  : new Tone.PolySynth(8, Tone.MembraneSynth),
//     "fm"        : new Tone.PolySynth(8, Tone.FMSynth)
//   };