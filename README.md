# Redurex

本来想起名为 reduck, 但是这个名字被占了。

在 redux 体系中，action + reducer + saga 如果写到一个文件中，社区称为 `duck`。redux 预置模板过多是经常被吐槽的一个点， 封装成一个 duck 文件稍许能减轻点负担。

`Redurex` 参考了 `dva`

- 彻底不写 `actionCreator`
- 和 `dva` 不同，我们不鼓励写字符串形式的 `type`，所有的 `actionCreator` 都自动收集到 `actions()` 中生成好了
- 不写 `watcher` 文件了
- 不像 dva 那样封闭，你可以在已有 Redux 的基础上，渐进引入，并且基本不会影响你和其它库的集成。

# Quick Start

```javascript
import duck, { actions, takeAll } from 'redurex';

export const friendsDuck = duck({
    namespace: 'friends',
    // 初始 state
    state: {},
    reducers: {
        resolveFriends: (state, payload, action) => {
            const { friends } = payload;
            console.log(action.type) // friends/resolveFriends
        }
    },
    sagas: {
        // 自动 take type 为 friends/requestFriends 的 action
        // 自动为 saga 注入 payload 、 _actions
        * requestFriends(payload, _actions) {
            yield put(_actions.resolveFriends({
                friends: [],
            }));
        },
        // 我们的 saga 会自动取消两次间隔特别短的 saga，需要使 saga 总是运行，要额外标志 takeAll
        requestSomething: takeAll(function* () {
            // ...
        }),
    },
});

dispatch(actions().friends.resolveFriends({
    friends: [1, 2, 3],
}));
dispatch(actions().friends.requestFriends({ id: 1 }));
```

# Install

```bash
# 必须已经安装 redux, redux-saga
npm i redurex --save
```

`configureStore`
```javascript
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { decompose } from 'redurex'
import ducks from './ducks' // 一个数组

export default function configureStore() {
    const { rootReducer, rootWatcher } = decompose(ducks)
    const sagaMiddleware = createSagaMiddleware()

    const store = createStore(rootReducer, applyMiddleware(sagaMiddleware))
    sagaMiddleware.run(rootWatcher.watch)
    return store
}
```

# actions

`redurex` 维护了一个全局的 `actions`，免去了定义 actionCreator 的烦恼。
通过 actions 函数，我们可以通过对应的 `namespace` 获取到该 duck 下所有的 actionCreator。

这一切都是自动化的，无需做任何配置。

```javascript
import { actions } from 'redurex';

actions().friends.resolveFriends({
    friends: [1, 2, 3],
});

// {
//     type: 'friends/resolveFriends',
//     payload: {
//         friends: [1, 2, 3],
//     }
// }
```

# duck 后的结构

`duck` 就是简单地封装了一些样板代码，其本质还是 `redux` + `redux-saga`

```javascript
console.log(friendsDuck);

{
    namespace: 'friends',
    state: {},
    // 类似于原始的 reducer
    reducer: ...
    // 一堆 take 了对应函数名的 actionType 的 watcher
    watchers: [
        {
            type: 'friends/requestFriends',
            saga: function* (payload) {
                yield put(actions.resolveFriends());
            },
        },
        {
            type: 'friends/requestSomething',
            saga: ...,
            takeAll: true,
        }
    ],
}
```

# FQA

- 如果 `reducer` 和 `saga` 中存在同名函数会怎么样？
  `dispatch` 该 `action` 后，对应的 `reducer` 和 `saga` 都会响应。
