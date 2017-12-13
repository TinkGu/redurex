import { combineReducers } from 'redux'
import { createRootWatcher } from './saga'

export default function decompose(rootDuck) {
    const { injectWatchers: injectAsyncWatchers, watch } = createRootWatcher()
    const rootReducerMap = {}

    rootDuck.forEach(({ watchers, reducer, namespace }) => {
        rootReducerMap[namespace] = reducer
        injectWatchers(watchers)
    })

    const createReducer = highOrderCreateReducer(rootReducerMap)
    const injectAsyncReducer = (store, name, asyncReducerMap) => {
        store.replaceReducer(createReducer(asyncReducerMap))
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
