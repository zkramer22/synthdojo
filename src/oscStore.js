import { writable } from "svelte/store";

export const octaves = writable(2)
export const homeOctave = writable(2)
export const voices = writable(1)
export const mouseDownNote = writable('')
export const keyDownNotes = writable([])