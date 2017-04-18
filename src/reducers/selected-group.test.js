import { assert } from 'chai'
import { RESET_SONG_SETS, resetSongSets } from '../actions'
import { SELECT_GROUP,    selectGroup   } from '../actions'
import reducer from './selected-group'

describe('selected group reducer', () => {
  describe('initial state', () => {
    it('is null', () => {
      assert.isNull(reducer(undefined, { type: 'INIT' }))
    })
  })

  describe(SELECT_GROUP, () => {
    it('selects the given group', () => {
      const group   = [{ title: 'a', artist: 'b', album: 'c', started: 'd' }]
      const initial = reducer(undefined, { type: 'INIT' })
      const updated = reducer(initial, selectGroup(group))
      assert.deepEqual(updated, group)
    })
  })

  describe(RESET_SONG_SETS, () => {
    it('sets the selected group to null', () => {
      const initial = reducer(
        reducer(undefined, { type: 'INIT' }),
        selectGroup([{ title: 'a', artist: 'b', album: 'c', started: 'd' }]))
      const updated = reducer(initial, resetSongSets())
      assert.isNull(updated)
    })
  })
})
