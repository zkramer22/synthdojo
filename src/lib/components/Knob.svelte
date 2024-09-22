<script>
    import knobdrag, { makeValueStore } from '$lib/knobdrag.js'
    import { formatTimeVal } from '$lib/formatters.js'
    import { INPUTS } from '$lib/keycodes.js'
    
    export let efxType = 'normal'
    export let min = 0
    export let max = 1
    export let step = (max - min) / 100
    export let value  // for display
    // export let store  // for access store.update()
    
    export let size
    export let bgColor
    export let color
    export let textColor
    export let textSize = Number(size / (size * 1.3)).toFixed(1)

    const defaultFormatter = (value, mult, fix) => Number((value * mult).toFixed(fix))
    const displayMods = {
        normal: {
            mult: 100,
            fix: 2,
            formatter: defaultFormatter,
        },
        time: {
            mult: 1,
            fix: 3,
            formatter: (value, mult, fix) => formatTimeVal(defaultFormatter(value, mult, fix)),
        }
    }
    let inputElem
    const valueStore = makeValueStore(value, newValue => value = newValue)

    $: enteringValue = false
    $: tempValue = ''
    $: displayValue = enteringValue ? tempValue : formatDisplayValue(value)
    $: valueStore.set(value)
    $: knobParams = { min, max, step, valueStore, inputElem }
    
    $: stroke = size / 10
    $: cx = size / 2
    $: cy = size / 2
    $: r = cx - stroke
    $: C = Math.PI * 2 * r
    $: prog = value / max
    $: strokeDash = C * (1 - prog)

    
    function formatDisplayValue(value) {
        const { mult, formatter, fix } = displayMods[efxType]
        const display = formatter(value, mult, fix)
        return display  // add dynamic formatting based on effect type
    }

    function checkTempValue() {
        if (!enteringValue) return
        if (tempValue === '') return enteringValue = false
        const { mult, fix } = displayMods[efxType]
        const converted = Number((tempValue / mult).toFixed(fix))
        valueStore.update(currentVal => converted < min ? min : converted > max ? max : converted)
        tempValue = ''
        enteringValue = false
    }

    function handleInputKey({ e, valueStore, min, max }) {
        const { code, key, metaKey, shiftKey, altKey, ctrlKey } = e
        let direction, isMac, modifier, fix
        const validKey = INPUTS[code]
        // console.log(code, key)
        if (!validKey) return
        switch (validKey) {
            case 'Arrow':
                direction = code === 'ArrowUp' ? 1 : -1
                isMac = navigator.platform.indexOf('Mac') === 0
                const { mult, fix } = displayMods[efxType]
                modifier = (isMac ? metaKey : ctrlKey) ? 100 : shiftKey ? 10 : altKey ? .1 : 1
                // modifier /= mult
                if (efxType === 'normal') { modifier /= mult }
                else if (efxType === 'time') { modifier = modifier / (mult * 100) }
                valueStore.update(currentVal => {
                    const newVal = Number((currentVal + (direction * modifier)).toFixed(fix))
                    return newVal < min ? min : newVal > max ? max : newVal
                })
                tempValue = ''
                enteringValue = false
                break
            case 'Digit':
                if (shiftKey || metaKey || altKey || ctrlKey) break
                enteringValue = true
                tempValue = tempValue + key
                break
            case 'Backspace':
                enteringValue = true
                if (tempValue.length) { tempValue = tempValue.slice(0, -1) }
                break
            case 'Enter':
                checkTempValue()
                break
            case 'Escape':
                enteringValue = false
                tempValue = ''
                break
            default:
                break
        }
    }

</script>

<div class="knobby" use:knobdrag="{knobParams}">
    <svg width="{size}" height="{size}" viewBox="{`0 0 ${size} ${size}`}">
        <!-- background color -->
        <circle cx="{cx}" cy="{cy}" r="{r}" fill="none" class="knob-bg"
                stroke="{bgColor}" 
                stroke-width="{stroke}" 
                 />

        <!-- filled value color -->
        <circle cx="{cx}" cy="{cy}" r="{r}" fill="none" class="knob-value"
                stroke="{color}" 
                stroke-width="{stroke}"
                stroke-dasharray="{`${C} ${C}`}" 
                stroke-dashoffset="{strokeDash}"/>
    </svg>

    <input type="number" class="val-input" min={min} max={max} step={step} style:font-size={`${textSize}rem`}
        on:keydown|preventDefault={ (e) => handleInputKey({ e, value, valueStore, min, max, step }) }
        on:focusout={ () => checkTempValue() } 
        bind:this={inputElem}
        bind:value={value} 
        />
    <div class="val-display" style:font-size={`${textSize}rem`} style:color={textColor}>
        { displayValue }
    </div>
</div>

<style lang="scss">
    .knobby {
        display: flex;
        flex-direction: column;
        place-content: center;
        position: relative;
        width: auto;
        margin: auto;
        cursor: pointer;
        svg {
            transform: rotate(90deg)
        }
    }
    .knob-bg {
        fill: #0000;
        pointer-events: painted;
    }
    .knob-value {
        fill: #0000;
        pointer-events: none;
    }
    input, .val-display {
        position: absolute;
        left: 0;
        right: 0;
        cursor: pointer;
        margin: auto;
        text-align: center;
        border: none;
        outline: none;
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10 and IE 11 */
        user-select: none;
    }
    input {
        padding: 0;
        max-width: 60%;
        color: transparent;
        &:focus {
            border: 1px solid white;
        }
        &::selection {
            background: transparent;
        }
    }
    .val-display {
        pointer-events: none !important;
    }
</style>