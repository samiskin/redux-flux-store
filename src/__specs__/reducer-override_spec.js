import test from 'tape';
import _ from 'lodash';
import { fluxEnhancer } from '../index';
import { createStore } from 'redux';


var store = null;
let overridingReducer = (state = {}, action) => {
  switch(action.type) {
    case 'RESET':
      return { counter: 0};
    default:
      return state;
  }
}

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

var CounterStore = new CounterStoreClass();


test('Reducer overriding', (t) => {
  t.plan(4);

  try {
    store = fluxEnhancer({
      counter: CounterStore,
    })(createStore)(overridingReducer);
  } catch (e) {
    t.fail('Errored on no reducer');
  }
  t.pass('Created store without a reducer');

  t.deepEquals(store.getState(), {counter: 0});
  store.dispatch({type: 'INCREMENT'});
  t.deepEquals(store.getState(), {counter: 1});
  store.dispatch({type: 'RESET'});
  t.deepEquals(store.getState(), {counter: 0});


});


