import { onDestroy } from 'svelte';
import { writable } from 'svelte/store';
import options from './options.js';
function hasCapture(pointerId, elem) {
    return elem.hasPointerCapture(pointerId) ||
        document.pointerLockElement === elem;
}
export default function knobdrag(elem, params) {
    const actions = new Map();
    actions.set('pointercapture', pointercapture(elem));
    options.subscribe($options => {
        actions.get('pointerlock')?.destroy();
        if ($options.lockCursor) {
            actions.set('pointerlock', pointerlock(elem));
        }
        else {
            actions.delete('pointerlock');
        }
    });
    let moved = false;
    function knobMove(event) {
        const { movementY, pointerId } = event;
        if (movementY && hasCapture(pointerId, elem)) {
            params.valueStore.update(value => {
                moved = true;
                return clamp(params.min, value - ((movementY) * params.step), params.max);
            });
        }
    }
    function knobRelease(_event) {
        if (moved === false) {
            params.inputElem.select();
        }
        moved = false;
    }
    elem.addEventListener("pointermove", knobMove);
    elem.addEventListener("pointerup", knobRelease);
    return {
        destroy() {
            actions.forEach(action => action.destroy());
            elem.removeEventListener("pointermove", knobMove);
            elem.removeEventListener("pointerup", knobMove);
        },
        update(newParams) {
            params = newParams;
        }
    };
}
export function makeValueStore(value, update) {
    const valueStore = writable(value);
    onDestroy(valueStore.subscribe(update));
    return valueStore;
}
function stopPropagation(event) {
    event.stopPropagation();
}
function preventDefault(event) {
    event.preventDefault();
}
function pointerlock(elem) {
    function enterLock(event) {
        if (event.button !== 2)
            elem.requestPointerLock();
    }
    function exitLock() {
        document.exitPointerLock();
    }
    function lockChange() {
        if (document.pointerLockElement === elem) {
            elem.addEventListener('pointermove', stopPropagation);
        }
        else {
            elem.removeEventListener('pointermove', stopPropagation);
        }
    }
    elem.addEventListener('mousedown', enterLock);
    elem.addEventListener('mouseup', exitLock);
    document.addEventListener('pointerlockchange', lockChange);
    return {
        destroy() {
            elem.removeEventListener('mousedown', enterLock);
            elem.removeEventListener('mouseup', exitLock);
            document.removeEventListener('pointerlockchange', lockChange);
        }
    };
}
function pointercapture(elem) {
    function pointerDown(event) {
        if (event.button !== 2)
            elem.setPointerCapture(event.pointerId);
    }
    elem.addEventListener('pointerdown', pointerDown);
    elem.addEventListener('touchmove', preventDefault);
    // TODO: unneeded?? ^
    return {
        destroy() {
            elem.removeEventListener('pointerdown', pointerDown);
            elem.removeEventListener('touchmove', preventDefault);
        }
    };
}
function clamp(a, b, c) {
    return Math.min(Math.max(a, b), c);
}
