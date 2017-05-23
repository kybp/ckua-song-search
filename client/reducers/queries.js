import { ADD_QUERY, CHANGE_QUERY, DELETE_QUERY } from '../actions'
import { TOGGLE_QUERY_LOCK } from '../actions'

export const field = (text, lockLeft, lockRight) => ({
  text:      text      === undefined ? ''    : text,
  lockLeft:  lockLeft  === undefined ? false : lockLeft,
  lockRight: lockRight === undefined ? false : lockRight
})

const queryFromAction = (action) => {
  const fieldFromObject = (object) => {
    if (object) {
      return field(object.text, object.lockLeft, object.lockRight)
    } else {
      return field()
    }
  }

  return {
    id:     action.id,
    artist: fieldFromObject(action.artist),
    title:  fieldFromObject(action.title),
    album:  fieldFromObject(action.album)
  }
}

const lock = (side) => {
  const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.substring(1)
  }
  return 'lock' + capitalize(side)
}

const initialState = []

export default (state = initialState, action) => {
  switch (action.type) {
  case ADD_QUERY:
    return state.concat(queryFromAction(action))
  case CHANGE_QUERY:
    const { id, artist, title, album } = action
    return state.map((query) => (
      query.id === action.id
        ? { id, artist, title, album }
        : query))
  case DELETE_QUERY:
    return state.filter((query) => query.id !== action.id)
  case TOGGLE_QUERY_LOCK:
    return state.map((query) => (
      query.id === action.id
        ? Object.assign({}, query, {
          [action.field]: Object.assign({}, query[action.field], {
            [lock(action.side)]: ! query[action.field][lock(action.side)]
          })
        })
        : query
    ))
  default:
    return state
  }
}
