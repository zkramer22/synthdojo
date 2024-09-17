import * as Tone from 'tone'

class Osc {
    constructor(args) {
        const { synth, envelope, volume, efx } = args

        this.SYNTHS = {
            sine: new Tone.PolySynth(Tone.Synth)
                .set({ oscillator: { type: 'sine' }}),
            saw: new Tone.PolySynth(Tone.Synth)
                .set({ oscillator: { type: 'sawtooth' }}),
            triangle: new Tone.PolySynth(Tone.Synth)
                .set({ oscillator: { type: 'triangle' }}),
            square: new Tone.PolySynth(Tone.Synth)
                .set({ oscillator: { type: 'square' }}),
            pluck: new Tone.PluckSynth({ 
                resonance: .955,
            }),
            fm: new Tone.PolySynth(Tone.FMSynth),
            am: new Tone.PolySynth(Tone.AMSynth),
        }

        this.EFFECTS = {
            cheby: new Tone.Chebyshev({
                wet: .3,
                order: 2,
            }),
            crusher: new Tone.BitCrusher({
                wet: 0.2,
            }),
            reverb: new Tone.Reverb({ 
                wet: 0.5,
                decay: 2,
            }),
            compressor: new Tone.Compressor({
                threshold: -6,
                attack: .02,
                knee: 12,
                release: .4,
                ratio: 20,
                wet: 1,
            }).toDestination(),
        }
        
        this.efx = efx
        this.volume = volume
        this.envelope = envelope
        this.synth = this.SYNTHS[synth]
        this.synth
            .set({ envelope, volume })
    }

    start() {
        Tone.start()  // maybe unnecessary
    }

    chainUp() {
        console.log('chaintime');
        const efx = Object.values(this.EFFECTS)
        this.synth.chain(...efx)
    }

    changeEnvelope(envelope) {
        this.envelope = envelope
    }

    changeSynth(synth) {
        this.synth = this.SYNTHS[synth]
            .set({ 
                envelope: this.envelope, 
                volume: this.volume,
            })
        this.chainUp()
    }

    noteEvent({ synthType, note, releaseArr }) {
        if (note) {  // note on
            this.synth.triggerAttack(note) 
        }
        else {  // note off
            if (synthType === 'pluck') return  // no Release needed for Pluck
            else { this.synth.triggerRelease(releaseArr) }  // Array needed for PolySynth
        }
    }
}

export default Osc