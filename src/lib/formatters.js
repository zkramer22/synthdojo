export function formatTimeVal(seconds) {
    let result;
    if (seconds < 1) { result = (seconds * 1000).toFixed(0) + 'ms' } 
    else { result = seconds.toFixed(2) + 's' }
    return result;
}