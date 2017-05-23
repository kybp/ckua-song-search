import { START_LOADING_SONGS, FINISH_LOADING_SONGS } from '../actions'

export default (state = false, action) => {
  switch (action.type) {
  case START_LOADING_SONGS:
    return true
  case FINISH_LOADING_SONGS:
    return false
  default:
    return state
  }
}
