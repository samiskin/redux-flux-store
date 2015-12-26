import test from 'tape';
import _ from 'lodash';
import { fluxEnhancer } from '../index';
import { createStore } from 'redux';

var store = null;
let basicReducer = (state = {}, action) => {
  return state;
}

class TeamStoreClass {
  getTeams() {
    return store.getState().teams;
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

let TeamStore = new TeamStoreClass();


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

let LeaderboardStore = new LeaderboardStoreClass();

store = fluxEnhancer({
  leaderboard: LeaderboardStore,
  teams: TeamStore
})(createStore)(basicReducer);

test('Example in README', (t) => {
  t.plan(2);
  t.deepEquals(store.getState(), {teams: {}, leaderboard: []});
  store.dispatch({type: 'ADD_TEAM', data: {team: {id: 'H42'}}});
  t.deepEquals(store.getState(), {teams: {H42: {score: 0, id: 'H42'}}, leaderboard: ['H42']})
});
