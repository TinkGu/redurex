export function warning(namespace, tip) {
    return console.warn(`redurex: in the namespace called ${namespace}, ${tip}`)
}

export function isObject(o) {
    return o ? (typeof o === 'object' || typeof o === 'function') : false
}

export function ownProperty(target, prop) {
    return Object.prototype.hasOwnProperty.call(target, prop)
}
