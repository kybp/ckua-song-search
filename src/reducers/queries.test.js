import { assert } from 'chai'
import { addQuery,    ADD_QUERY    } from '../actions'
import { changeQuery, CHANGE_QUERY } from '../actions'
import { deleteQuery, DELETE_QUERY } from '../actions'
import reducer from './queries'

const isEmptyQuery = (object) => {
  const { id, artist, title, album } = object

  return typeof id === 'number' &&
    artist === '' &&
    title  === '' &&
    album  === ''
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
      const initial = [{ id: 0, artist: 'a', title: 'b', album: 'c' }]
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
      const initial = [{ id: 0, artist: 'a', title: 'b', album: 'c' }]
      const query   = { artist: 'd', title: 'e', album: 'f' }
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
      { id: 0, artist: 'a', title: 'b', album: 'c' },
      { id: 1, artist: 'd', title: 'e', album: 'f' }
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
        { id: 0, artist: 'a', title: 'b', album: 'c' },
        { id: 1, artist: 'd', title: 'e', album: 'f' },
        { id: 2, artist: 'g', title: 'h', album: 'i' }
      ]
      const updated = reducer(initial, deleteQuery(initial[1].id))
      assert.deepEqual(updated, [initial[0], initial[2]])
    })
  })
})
