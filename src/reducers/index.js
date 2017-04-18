import { combineReducers } from 'redux'
import dates from './dates'
import loadingSongs from './loading-songs'
import queries from './queries'
import selectedGroup from './selected-group'
import songSets from './song-sets'

export default combineReducers({
  dates,
  loadingSongs,
  queries,
  selectedGroup,
  songSets
})
