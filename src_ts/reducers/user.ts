import {Reducer} from 'redux';
import {UPDATE_USER_DATA} from '../actions/user';
import {IEtoolsUserModel} from '../components/user/user-model';
import {RootAction} from '../store.js';

export interface UserState {
  data: IEtoolsUserModel | null;
}

const INITIAL_USER_DATA: UserState = {
  data: null
};

const userData: Reducer<UserState, RootAction> = (state = INITIAL_USER_DATA, action) => {
  switch (action.type) {
    case UPDATE_USER_DATA:
      // TODO: improve this after more actions are added (like permission processing for ex)
      return {
        ...state,
        data: action.userData
      };
    default:
      return state;
  }
};

export default userData;
