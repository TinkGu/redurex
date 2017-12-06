const _actions = {}

const SEP = '/'
export function createActionType(namespace, key) {
    return `${namespace}${SEP}${key}`
}

export function createActionCreator(type, namespace) {
    return (payload = {}) => ({
        type,
        namespace,
        payload,
    })
}

function registerNamespace(namespace) {
    if (!(namespace in _actions)) {
        _actions[namespace] = {}
    }
}

export function registerAction(namespace, key) {
    const type = createActionType(namespace, key)
    registerNamespace(namespace)
    _actions[namespace][key] = createActionCreator(type, namespace)
}

export default function getActions(namespace) {
    return Object.assign({}, namespace ? (_actions[namespace] || {}) : _actions)
}
