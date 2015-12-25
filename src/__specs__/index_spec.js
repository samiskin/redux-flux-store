import test from 'tape';
import _ from 'lodash';
import { fluxEnhancer } from '../index';
import { createStore } from 'redux';


class CounterStoreClass {
  reduce(state = 0, action, waitFor) {
    switch(action.type) {
      case 'INCREMENT':
        return state + 1;
      case 'DECREMENT':
        return state - 1;
      default:
        return state;
    }
  }
}

let basicReducer = (state = {}, action) => {
  return state;
}

let CounterStore = new CounterStoreClass();

test('Basic functionality', (t) => {

  t.plan(2);
  let store = fluxEnhancer({
    counter: CounterStore
  })(createStore)(basicReducer);
  t.deepEquals(store.getState(), {counter: 0});
  store.dispatch({type: 'INCREMENT'});
  t.deepEquals(store.getState(), {counter: 1});



});
