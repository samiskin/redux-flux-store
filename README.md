# redux-flux-store

This [store enhancer](https://github.com/rackt/redux/blob/master/docs/Glossary.md#store-enhancer) allows  objects which resemble stores in traditional Flux to be used in a [Redux](https://github.com/rackt/redux/) Reducer.  The motivation for this was to allow both the mutations for a property as well as the accessors to be in the same file, as a change in one will likely result in a change in the other.  In traditional Flux this was the purpose of a Store, however Redux keeps these two tasks separated into Reducers and Selector.

## Installation
```
npm i redux-flux-store
```

## Usage

Note: The term `store` is used to describe an object with a `reduce(state, action, waitFor)` method.
- `state` (_Object_) - The value of the entry in the global redux state.
- `action` (_Object_) - The redux action of the form `{type: String, ...}`
- `waitFor` (_Function_) - A function which takes an array of stores and ensures that the values for the specified stores will be updated before continuing execution.

#### fluxEnhancer(storeMap: Object)

`storeMap`: An object which matches a key in the global state to a flux `store` which manages that key.

```javascript

// TeamStore.js
import Store from 'ReduxStore.js';

class TeamStore {
  getTeams() {
    return Store.getState().teams;
  }

  initializeBasicTeam(teamData) {
    return Object.assign({}, teamData, {score: 0});
  }
  addTeam(state, teamData) {
    let update = {};
    update[teamData.id] = this.initializeBasicTeam(teamData);
    return Object.assign({}, state, update);
  }

  reduce(state = {}, action, waitFor) {
    switch(action.type) {
    case 'ADD_TEAM':
      return this.addTeam(state, action.data.team);
    default:
      return state;
    }
  }
}

export default new TeamStore();

// LeaderboardStore.js
import TeamStore from 'stores/TeamStore';

class LeaderboardStoreClass {
  handleNewTeam(currentLeaderboard, teamId, waitFor) {
    waitFor([TeamStore]);
    let teams = TeamStore.getTeams();
    let newTeam = teams[teamId];
    let leaderboard = _.assign([], currentLeaderboard);
    let index = _.sortedIndex(currentLeaderboard, newTeam.id, (teamId) => {
      return teams[teamId].score;
    })
    leaderboard.splice(index, 0, newTeam.id);
    return leaderboard;
  }

  reduce(state = [], action, waitFor) {
    switch(action.type) {
    case 'ADD_TEAM':
      return this.handleNewTeam(state, action.data.team.id, waitFor);
    default:
      return state;
    }
  }
}

export default new LeaderboardStore();

// ReduxStore.js
import { fluxEnhancer } from 'redux-flux-store';
import TeamStore from 'stores/TeamStore';
import LeaderboardStore from 'stores/LeaderboardStore';

let finalCreateStore = compose(
  fluxEnhancer({
    leaderboard: LeaderboardStore,
    teams: TeamStore
  }),
  applyMiddleware(...middleware),
)(createStore);

let store = finalCreateStore(reducer);

console.log(store.getState());
// { teams: {}, leaderboard: [], ...reducer() }

store.dispatch({type: 'ADD_TEAM', data: {team: {id: 'H42'}}});
console.log(store.getState());
// { teams: {H42: {score: 0, id: 'H42'}}, leaderboard: ['H42'], ...reducer(state, action)}

export default store;
```
