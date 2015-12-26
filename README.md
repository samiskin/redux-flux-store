# redux-flux-store

This [store enhancer](https://github.com/rackt/redux/blob/master/docs/Glossary.md#store-enhancer) allows  objects which resemble stores in traditional Flux to be used in a [Redux](https://github.com/rackt/redux/) Reducer.

## Installation
```
npm i redux-flux-store
```

## Usage

#### fluxEnhancer(storeMap: Object)

`storeMap`: An object which matches a key in the global state to a flux `store` which manages that key.  A `store` is an object with a `reduce(state = defaultValue, action)` method.  In the current version of this enhancer, Flux's `waitFor` method can be implemented using a `this.storeDependencies = [StoreToUpdateFirst]` property on the store.  A proper waitFor implementation should be out in 0.2.

```javascript

// CounterStore.js
import Store from 'ReduxStore.js';

class CounterStore {
  getCount() {
    return Store.getState().counter;
  }

  reduce(state = 0, action) {
    switch(action.type) {
    case 'INCREMENT':
      return state + 1;
    default:
      return state;
    }
  }
}

export default new CounterStore();

// ---------------------------------------------------
// ReduxStore.js
import { fluxEnhancer } from 'redux-flux-store';
import CounterStore from 'stores/CounterStore';

let finalCreateStore = compose(
  fluxEnhancer({
    counter: CounterStore
  }),
  applyMiddleware(...middleware),
)(createStore);

let store = finalCreateStore(reducer);

console.log(store.getState());
// { counter: 0, ...reducer() }

store.dispatch({type: 'INCREMENT'});
// { counter: 1, ...reducer(state, {type: 'INITIALIZE'})}

export default store;
```
