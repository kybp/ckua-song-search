import { combineReducers } from 'redux'
import loadingSongs from './loading-songs'
import queries from './queries'
import songSets from './song-sets'

export default combineReducers({ loadingSongs, queries, songSets })
