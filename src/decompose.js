import { combineReducers } from 'redux'
import { createRootWatcher } from './saga'

export default function decompose(rootDuck) {
    const rootWatcher = createRootWatcher()
    const rootReducer = {}

    rootDuck.forEach(({ watchers, reducer, namespace }) => {
        rootReducer[namespace] = reducer
        rootWatcher.injectWatchers(watchers)
    })

    return {
        rootReducer: combineReducers(rootReducer),
        rootWatcher,
    }
}
