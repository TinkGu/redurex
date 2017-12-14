import { effects } from 'redux-saga'
import { isObject } from './utils'
import actions from './actions'

const { take, call, fork, cancel } = effects

// interface Watcher {
//     saga: GenerationFunction,
//     takeAll: boolean,
//     type: string,
//     task: SagaTask,
// }

export function createRootWatcher() {
    const watcherMap = {} // cache all sagas

    // watch every action, throttle dispatch
    function* watch() {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { type, payload, namespace } = yield take('*')
            const watcher = watcherMap[type]

            if (watcher) {
                if (watcher.takeAll) {
                    yield fork(watcher.saga, payload, actions(namespace))
                } else {
                    yield call(cancelLastTask, type)
                    const task = yield fork(watcher.saga, payload, actions(namespace))
                    yield call(pushTask, task, type)
                }
            }
        }
    }

    function pushTask(task, type) {
        watcherMap[type].task = task
    }

    function* cancelLastTask(type) {
        if (watcherMap[type].task) {
            yield cancel(watcherMap[type].task)
            watcherMap[type].task = null
        }
    }

    function injectAsyncWatchers(watchers = []) {
        watchers.forEach(({ takeAll: _takeAll, type, saga }) => {
            watcherMap[type] = {
                task: null,
                saga,
                takeAll: _takeAll,
            }
        })
    }

    return {
        watch,
        injectAsyncWatchers,
    }
}

export function takeAll(duckSaga) {
    let result = {
        takeAll: true,
    }

    if (typeof duckSaga === 'function') {
        result = {
            ...result,
            saga: duckSaga,
        }
    }

    if (isObject(duckSaga)) {
        result = {
            ...duckSaga,
            ...result,
        }
    }

    return result
}
