import test from 'tape';
import _ from 'lodash';
import { fluxEnhancer } from '../index';
import { createStore } from 'redux';


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

let IncrementStore = new IncrementStoreClass();

class CounterStoreClass {

  constructor() {
    this.storeDependencies = [IncrementStore];
  }

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

class IndependantCounterStoreClass extends CounterStoreClass {
  constructor() {
    super();
    this.storeDependencies = [];
  }
}

let CounterStore = new CounterStoreClass();
let IndependantCounterStore = new IndependantCounterStoreClass();

var store = fluxEnhancer({
  counterIndependant: IndependantCounterStore,
  counter: CounterStore,
  increment: IncrementStore
})(createStore)(basicReducer);

test('Basic functionality', (t) => {
  t.plan(2);
  t.deepEquals(store.getState(), {counter: 0, counterIndependant: 0, increment: 1});
  store.dispatch({type: 'INCREMENT'});
  t.deepEquals(store.getState(), {counter: 2, counterIndependant: 1, increment: 2});
});
