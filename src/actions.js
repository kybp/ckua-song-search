export const ADD_QUERY         = 'ADD_QUERY'
export const CHANGE_QUERY      = 'CHANGE_QUERY'
export const DELETE_QUERY      = 'DELETE_QUERY'
export const TOGGLE_QUERY_LOCK = 'TOGGLE_QUERY_LOCK'

export const ADD_SONG_SETS   = 'ADD_SONG_SETS'
export const RESET_SONG_SETS = 'RESET_SONG_SETS'

export const START_LOADING_SONGS  = 'START_LOADING_SONGS'
export const FINISH_LOADING_SONGS = 'FINISH_LOADING_SONGS'

export const SET_START_DATE = 'SET_START_DATE'
export const SET_END_DATE   = 'SET_END_DATE'
export const RESET_DATES    = 'RESET_DATES'
export const INVALID_DATE   = 'INVALID_DATE'

export const SELECT_GROUP = 'SELECT_GROUP'

let queryId = 1

export const addQuery = (object) => Object.assign({}, object, {
  type: ADD_QUERY,
  id:   queryId++
})

export const changeQuery = ({ id, artist, title, album }) => ({
  type: CHANGE_QUERY,
  id, artist, title, album
})

export const deleteQuery = (id) => ({
  type: DELETE_QUERY,
  id
})

export const toggleQueryLock = (id, field, side) => ({
  type: TOGGLE_QUERY_LOCK,
  id, field, side
})

export const resetQueries = () => ({
  type: RESET_QUERIES
})

export const addSongSets = (songs) => ({
  type: ADD_SONG_SETS,
  songs
})

export const resetSongSets = () => ({
  type: RESET_SONG_SETS
})

export const startLoadingSongs = () => ({
  type: START_LOADING_SONGS
})

export const finishLoadingSongs = () => ({
  type: FINISH_LOADING_SONGS
})

export const setStartDate = (date) => ({
  type: SET_START_DATE,
  date
})

export const setEndDate = (date) => ({
  type: SET_END_DATE,
  date
})

export const resetDates = () => ({
  type: RESET_DATES
})

export const selectGroup = (group) => ({
  type: SELECT_GROUP,
  group
})
