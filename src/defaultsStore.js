import { readable } from "svelte/store";

export const defaultRipple = readable({
    duration: .275,
    maxRadius: 0,
    center: false,
    disabled: false,
})

export const defaultEfxKnob = readable({ 
    min: 0, 
    max: 1, 
    step: .01,
})