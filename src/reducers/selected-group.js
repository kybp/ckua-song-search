import { RESET_SONG_SETS, SELECT_GROUP } from '../actions'

const initialState = null

const selectedGroup = (state = initialState, action) => {
  switch (action.type) {
  case SELECT_GROUP:
    return action.group
  case RESET_SONG_SETS:
    return initialState
  default:
    return state
  }
}

export default selectedGroup
