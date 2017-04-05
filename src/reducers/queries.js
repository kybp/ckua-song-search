import { ADD_QUERY, CHANGE_QUERY, DELETE_QUERY } from '../actions'

export default (state = [], action) => {
  switch (action.type) {
  case ADD_QUERY:
    return state.concat({
      id:     action.id,
      artist: action.artist || '',
      title:  action.title  || '',
      album:  action.album  || '' })
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
