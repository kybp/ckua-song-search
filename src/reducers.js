import { combineReducers } from 'redux'
import { ADD_QUERY, CHANGE_QUERY, DELETE_QUERY } from './actions'
import { ADD_SONG_SETS, RESET_SONG_SETS } from './actions'
import { START_LOADING_SONGS, FINISH_LOADING_SONGS } from './actions'

export const queries = (state = [], action) => {
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

export const songSets = (state = [], action) => {
  switch (action.type) {
  case ADD_SONG_SETS:
    return state.concat(action.songs)
  case RESET_SONG_SETS:
    return []
  default:
    return state
  }
}

export const loadingSongs = (state = false, action) => {
  switch (action.type) {
  case START_LOADING_SONGS:
    return true
  case FINISH_LOADING_SONGS:
    return false
  default:
    return state
  }
}

export default combineReducers({ loadingSongs, queries, songSets })
