import { readable } from "svelte/store";

export const defaultRipple = readable({
    duration: .275,
    maxRadius: 0,
    center: false,
    disabled: false,
})