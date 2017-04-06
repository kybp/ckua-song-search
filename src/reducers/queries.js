import { ADD_QUERY, CHANGE_QUERY, DELETE_QUERY } from '../actions'

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

export default (state = [], action) => {
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
  default:
    return state
  }
}
