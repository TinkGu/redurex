import { combineReducers } from 'redux'
import { createRootWatcher } from './saga'

export default function decompose(rootDuck) {
    const { injectAsyncWatchers, watch } = createRootWatcher()
    const rootReducerMap = {}

    rootDuck.forEach(({ watchers, reducer, namespace }) => {
        rootReducerMap[namespace] = reducer
        injectAsyncWatchers(watchers)
    })

    const createReducer = highOrderCreateReducer(rootReducerMap)
    const injectAsyncReducer = (store, name, asyncReducer) => {
        store.replaceReducer(createReducer({
            [name]: asyncReducer
        }))
    }

    const injectAsyncDuck = store => duck => {
        const { namespace, reducer, watchers } = duck
        !!reducer && injectAsyncReducer(store, namespace, reducer)
        !!watchers && injectAsyncWatchers(watchers)
    }

    return {
        rootReducer: combineReducers(rootReducerMap),
        rootWatcher: watch,
        injectAsyncDuck,
        injectAsyncReducer,
        injectAsyncWatchers,
    }
}

function highOrderCreateReducer(initialReducerMap) {
    let lastReducerMap = initialReducerMap || {}
    return function createReducer(asyncReducerMap) {
        if (!asyncReducerMap) {
            return lastReducerMap
        }

        lastReducerMap = Object.assign({}, lastReducerMap, asyncReducerMap)
        return combineReducers(lastReducerMap)
    }
}
