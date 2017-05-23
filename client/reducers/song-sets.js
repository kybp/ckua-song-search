import { ADD_SONG_SETS, RESET_SONG_SETS } from '../actions'

export default (state = [], action) => {
  switch (action.type) {
  case ADD_SONG_SETS:
    return state.concat(action.songs)
  case RESET_SONG_SETS:
    return []
  default:
    return state
  }
}
