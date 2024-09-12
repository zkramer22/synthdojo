import { readable } from "svelte/store";

export const defaultRipple = readable({
    color: "rgba(255,255,255,0.3)",
    duration: .275,
    maxRadius: 0,
    center: false,
    disabled: false,
})