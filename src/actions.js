export const ADD_QUERY    = 'ADD_QUERY'
export const CHANGE_QUERY = 'CHANGE_QUERY'
export const DELETE_QUERY = 'DELETE_QUERY'

let queryId = 1

export const addQuery = () => ({
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
