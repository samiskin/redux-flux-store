import _ from 'lodash';
import objectMerge from './object-merge';

/**
 * Creates a store enhancer which augments the store's state to include keys
 * and values specified by Store's similar to those used in traditional Flux
 * @param {Object} storeMap - A mapping of a property key to an object which contains a `reduce(state, action, waitFor)` method
*/
export function fluxEnhancer(storeMap) {
  return (storeCreator) => {
    return (inputReducer, initialState) => {
      let reducer = inputReducer || (() => { return {}; });

      // Map stores -> keys for easy access in reduce
      let storesToKeys = _.reduce(storeMap, (result, store, key) => {
        return result.set(store, key);
      }, new Map());

      // This allows Stores to call getState() on a different store
      // that it depends on in the middle of its own reduction, using
      // the other store's value after it reduces the action.
      let partiallyReducedState = null;

      // Runs an action through all the stores and returns a new state
      // variable with the new state of all the keys in storeMap
      let reduceFromStores = (state = {}, action) => {
        let newState = {};
        let completedSet = new Set();
        partiallyReducedState = Object.assign({}, state);

        // Var is used since assignKey and waitFor call each other
        var waitFor = (stores) => { // eslint-disable-line
          _.forEach(stores, (store) => assignKey(storesToKeys.get(store))); // eslint-disable-line
        };

        var assignKey = (key) => { // eslint-disable-line
          if (completedSet.has(key)) return;
          let store = storeMap[key];
          newState[key] = store.reduce.bind(store)(state[key], action, waitFor);
          partiallyReducedState[key] = newState[key];
          completedSet.add(key);
        };

        _.forEach(Object.keys(storeMap), assignKey);

        partiallyReducedState = null;
        return newState;
      };

      let augmentedReducer = (state, action) => {
        let storeResult = reduceFromStores(state, action);
        let reducerResult = reducer(state, action);
        return objectMerge(reducerResult, storeResult);
      };

      let store = storeCreator(augmentedReducer, initialState);
      let storeDotGetState = store.getState;
      store.getState = () => {
        return partiallyReducedState || storeDotGetState();
      };

      return store;
    };
  };
}
