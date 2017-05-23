import { assert } from 'chai'
import { addSongSets,   ADD_SONG_SETS   } from '../actions'
import { resetSongSets, RESET_SONG_SETS } from '../actions'
import reducer from './song-sets'

describe('songs reducer', () => {
  const songSetList = [[
    { artist: 'a', title: 'b', album: 'd', started: 'e' },
    { artist: 'f', title: 'g', album: 'h', started: 'i' }
  ], [
    { artist: 'j', title: 'k', album: 'l', started: 'm' }
  ]]

  describe('initial state', () => {
    it('is an empty array', () => {
      const initial = reducer(undefined, { type: 'INIT' })
      assert.deepEqual(initial, [])
    })
  })

  describe(RESET_SONG_SETS, () => {
    it('clears the list of song sets', () => {
      const initial = songSetList
      const updated = reducer(initial, resetSongSets())
      assert.deepEqual(updated, [])
    })
  })

  describe(ADD_SONG_SETS, () => {
    it('adds the given songs to the list', () => {
      const initial  = songSetList.slice(0, 1)
      const songSets = songSetList.slice(1)
      const updated  = reducer(initial, addSongSets(songSets))
      assert.deepEqual(updated, songSetList)
    })
  })
})
