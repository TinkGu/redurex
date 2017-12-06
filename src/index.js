import { warning, isObject } from './utils'
import actions, { registerAction, createActionType } from './actions'
import decompose from './decompose'

// create actions and reducerMap from duck.reducers
const foldReducers = advancedExtract(({
    key,
    type,
    result,
    typeMap: reducers,
}) => {
    const { reducerMap } = result
    return {
        reducerMap: {
            ...reducerMap,
            [type]: reducers[key],
        },
    }
}, {
    reducerMap: {},
})

// create actions and watchers from duck.sagas
const joinWatchers = advancedExtract(({
    key,
    type,
    result,
    typeMap: sagas,
}) => {
    const { watchers } = result
    const meta = createSagaMeta(sagas[key])

    if (!meta) return { watchers }

    const saga = { ...meta, type }
    return {
        watchers: [...watchers, saga],
    }
}, {
    watchers: [],
})

function advancedExtract(transreducer, start = {}) {
    return function innerExtractActions(typeMap, namespace) {
        if (!isObject(typeMap)) return {}
        const keys = Object.keys(typeMap)
        return keys.reduce((result, key) => {
            const type = createActionType(namespace, key)
            registerAction(namespace, key)

            return typeof transreducer === 'function' ? transreducer({
                result,
                namespace,
                typeMap,
                type,
                key,
            }) : {}
        }, start)
    }
}

function createSagaMeta(maybeSaga) {
    let meta = null

    if (typeof maybeSaga === 'function') {
        meta = {
            saga: maybeSaga,
        }
    }

    if (isObject(maybeSaga) && typeof maybeSaga.saga === 'function') {
        meta = maybeSaga
    }

    return meta
}

function createReduxReducer(funcMap, initialState) {
    if (!isObject(funcMap)) return null
    return (state = initialState, action) => funcMap.hasOwnProperty(action.type)
        ? funcMap[action.type](state, action && action.payload, action)
        : state
}

export default function duck({
    namespace,
    state,
    reducers,
    sagas,
}) {
    if (!namespace) {
        console.warn('redurex: namespace should be a string, and should not be empty!')
    }

    const duckMeta = arguments[0]

    if (duckMeta.hasOwnProperty('reducer')) {
        warning('[reducer] is useless, please use [reducers] instead.')
    }

    if (duckMeta.hasOwnProperty('saga')) {
        warning('[saga] is useless, please use [sagas] instead.')
    }

    const { reducerMap } = foldReducers(reducers, namespace)
    const { watchers } = joinWatchers(sagas, namespace)
    const reduxReducer = createReduxReducer(reducerMap, state)

    return {
        namespace,
        reducer: reduxReducer,
        watchers,
    }
}

export {
    duck,
    actions,
    decompose,
    createActionType,
}
