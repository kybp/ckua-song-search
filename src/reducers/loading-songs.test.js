import { assert } from 'chai'
import { startLoadingSongs,  START_LOADING_SONGS  } from '../actions'
import { finishLoadingSongs, FINISH_LOADING_SONGS } from '../actions'
import reducer from './loading-songs'

describe('loading songs reducer', () => {
  describe('initial state', () => {
    it('is false', () => {
      const initial = reducer(undefined, { type: 'INIT' })
      assert.strictEqual(initial, false)
    })
  })

  describe(START_LOADING_SONGS, () => {
    it('sets the state to true', () => {
      const state = reducer(false, startLoadingSongs())
      assert.strictEqual(state, true)
    })
  })

  describe(FINISH_LOADING_SONGS, () => {
    it('sets the state to false', () => {
      const state = reducer(true, finishLoadingSongs())
      assert.strictEqual(state, false)
    })
  })
})
