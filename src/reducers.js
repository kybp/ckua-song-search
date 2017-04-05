import { combineReducers } from 'redux'
import { ADD_QUERY, CHANGE_QUERY, DELETE_QUERY } from './actions'

const initialQueries = [{
  id:     0,
  artist: '',
  title:  '',
  album:  ''
}]

export const queries = (state = initialQueries, action) => {
  switch (action.type) {
  case ADD_QUERY:
    return state.concat({ id: action.id, artist: '', title: '', album: '' })
  case CHANGE_QUERY:
    const { id, artist, title, album } = action
    return state.map((query) => (
      query.id === action.id
        ? { id, artist, title, album }
        : query
    ))
  case DELETE_QUERY:
    return state.filter((query) => query.id !== action.id)
  default:
    return state
  }
}

export default combineReducers({ queries })
