import _ from 'lodash';
import objectMerge from 'object-merge';

function initializeStoreMap(stateStoreMap) {
  let invertedMap = _.transform(stateStoreMap, (map, store, prop) => {
    return map.set(store, prop);
  }, new Map());

  let waitingSet = new Set();
  let storeMap = new Map();
  _.forEach(stateStoreMap, (store) => waitingSet.add(store));

  let assignStore = (store) => {
    if (storeMap.has(store)) return;
    if (store === undefined || !waitingSet.has(store)) {
      throw new Error('Undefined store, check for circular dependencies in storeDependencies');
    }

    waitingSet.delete(store);
    if (Array.isArray(store.storeDependencies)) {
      store.storeDependencies.forEach((dependency) => assignStore(dependency));
    }
    storeMap.set(store, invertedMap.get(store));
  };

  while (waitingSet.size > 0) {
    let store = waitingSet.entries().next().value[0];
    assignStore(store);
  }

  return storeMap;
}

export function fluxEnhancer(stateStoreMap) {
  return (storeCreator) => {
    return (reducer, initialState) => {

      let storeMap = initializeStoreMap(stateStoreMap);
      let partiallyReducedState = null;
      let reduceFromStores = (state = {}, action) => {
        let newState = {};
        partiallyReducedState = _.assign({}, state);

        for (let entry of storeMap) {
          let key = entry[1];
          let store = entry[0];
          if (!store.reduce) throw new Error(`${store.constructor.name} must provide a reduce function`);

          newState[key] = store.reduce.bind(store)(state[key], action);
          partiallyReducedState[key] = newState[key];
        }
        partiallyReducedState = null;
        return newState;
      }

      let augmentedReducer = (state, action) => {
        let storeResult = reduceFromStores(state, action);
        let reducerResult = reducer(state, action);
        return objectMerge(reducerResult, storeResult);
      }

      let store = storeCreator(augmentedReducer, initialState);
      let storeDotGetState = store.getState;
      store.getState = () => {
        return partiallyReducedState || storeDotGetState();
      };

      return store;

    };
  };
}
