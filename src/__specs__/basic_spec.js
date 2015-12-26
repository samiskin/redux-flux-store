import test from 'tape';
import _ from 'lodash';
import { fluxEnhancer } from '../index';
import { createStore } from 'redux';


var store = null;
let basicReducer = (state = {}, action) => {
  return state;
}

class IncrementStoreClass {

  getIncrement() {
    return store.getState().increment;
  }


  reduce(state = 1, action) {
    switch(action.type) {
      case 'INCREMENT':
        return state + 1;
      default:
        return state;
    }
  }
}

var IncrementStore = new IncrementStoreClass();

class IndependantCounterStoreClass {
  reduce(state = 0, action, waitFor) {
    let amt = 1;
    switch(action.type) {
      case 'INCREMENT':
        amt = IncrementStore.getIncrement();
        return state + amt;
      case 'DECREMENT':
        amt = IncrementStore.getIncrement();
        return state - amt;
      default:
        return state;
    }
  }
}

class DependantCounterStoreClass extends IndependantCounterStoreClass{
  reduce(state = 0, action, waitFor) {
    waitFor([IncrementStore]);
    return super.reduce(state, action, waitFor);
  }
}

var DependantCounterStore = new DependantCounterStoreClass();
var IndependantCounterStore = new IndependantCounterStoreClass();

store = fluxEnhancer({
  counterIndependant: IndependantCounterStore,
  counter: DependantCounterStore,
  increment: IncrementStore
})(createStore)(basicReducer);

test('Basic functionality', (t) => {
  t.plan(2);
  t.deepEquals(store.getState(), {counter: 0, counterIndependant: 0, increment: 1});
  store.dispatch({type: 'INCREMENT'});
  t.deepEquals(store.getState(), {counter: 2, counterIndependant: 1, increment: 2});
});
