import { assert } from 'chai'
import { addQuery,        ADD_QUERY         } from '../actions'
import { changeQuery,     CHANGE_QUERY      } from '../actions'
import { deleteQuery,     DELETE_QUERY      } from '../actions'
import { toggleQueryLock, TOGGLE_QUERY_LOCK } from '../actions'
import reducer, { field } from './queries'

const isEmptyQuery = (object) => {
  const isField = (object) => (
    Object.keys(object).length === 3 &&
      typeof object.text      === 'string'  &&
      typeof object.lockLeft  === 'boolean' &&
      typeof object.lockRight === 'boolean'
  )

  const { id, artist, title, album } = object

  return typeof object.id === 'number' &&
    isField(object.artist) &&
    isField(object.title)  &&
    isField(object.album)
}

describe('queries reducer', () => {
  describe('initial state', () => {
    it('is an empty array', () => {
      const initial = reducer(undefined, { type: 'INIT' })

      assert.deepEqual(initial, [])
    })
  })

  describe(ADD_QUERY, () => {
    describe('with no parameters', () => {
      const initial = [{
        id: 0, artist: field('a'), title: field('b'), album: field('c') }]
      const updated = reducer(initial, addQuery())

      it('leaves existing queries intact', () => {
        assert.deepEqual(updated[0], initial[0])
      })

      it('adds an element', () => {
        assert.strictEqual(updated.length, initial.length + 1)
      })

      it('adds an empty query', () => {
        assert(isEmptyQuery(updated[1]))
      })
    })

    describe('with a query object', () => {
      const initial = [
        { id: 0, artist: field('a'), title: field('b'), album: field('c') }]
      const query = {
        artist: field('d'), title: field('e'), album: field('f') }
      const updated = reducer(initial, addQuery(query))

      it('adds an "id" property to the object', () => {
        assert.strictEqual(typeof updated[1].id, 'number')
        assert.deepEqual(updated[1], Object.assign({}, query, {
          id: updated[1].id
        }))
      })
    })
  })

  describe(CHANGE_QUERY, () => {
    const initial = [
      { id: 0, artist: field('a'), title: field('b'), album: field('c') },
      { id: 1, artist: field('d'), title: field('e'), album: field('f') }
    ]

    it('updates the given query', () => {
      const newTitle = initial[0].title + '.'
      const newQuery = Object.assign({}, { title: newTitle }, initial[0])
      const expected = [newQuery, initial[1]]
      const actual   = reducer(initial, changeQuery(expected))
      assert.deepEqual(expected, actual)
    })
  })

  describe(DELETE_QUERY, () => {
    it('deletes the indicated query', () => {
      const initial = [
        { id: 0, artist: field('a'), title: field('b'), album: field('c') },
        { id: 1, artist: field('d'), title: field('e'), album: field('f') },
        { id: 2, artist: field('g'), title: field('h'), album: field('i') }
      ]
      const updated = reducer(initial, deleteQuery(initial[1].id))
      assert.deepEqual(updated, [initial[0], initial[2]])
    })
  })

  describe(TOGGLE_QUERY_LOCK, () => {
    describe('when the side is locked', () => {
      it('unlocks that side', () => {
        const initial = [{
          id: 0, artist: field('a', true),
          title: field('b'), album: field('c')
        }]
        const updated = reducer(initial, toggleQueryLock(0, 'artist', 'left'))
        assert.deepEqual(updated[0].artist, Object.assign(
          {}, initial[0].artist, { lockLeft: false }))
      })
    })

    describe('when the side is unlocked', () => {
      it('locks that side', () => {
        const initial = [{
          id: 0, artist: field('a', false, true),
          title: field('b'), album: field('c')
        }]
        const updated = reducer(initial, toggleQueryLock(0, 'artist', 'right'))
        assert.deepEqual(updated[0].artist, Object.assign(
          {}, initial[0].artist, { lockRight: false }))
      })
    })
  })
})
