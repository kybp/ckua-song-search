import { assert } from 'chai'
import { loadingSongs, queries, songSets } from './reducers'
import { addQuery,    ADD_QUERY    } from './actions'
import { changeQuery, CHANGE_QUERY } from './actions'
import { deleteQuery, DELETE_QUERY } from './actions'
import { addSongSets,   ADD_SONG_SETS   } from './actions'
import { resetSongSets, RESET_SONG_SETS } from './actions'
import { startLoadingSongs,  START_LOADING_SONGS  } from './actions'
import { finishLoadingSongs, FINISH_LOADING_SONGS } from './actions'

const isEmptyQuery = (object) => {
  const { id, artist, title, album } = object

  return typeof id === 'number' &&
    artist === '' &&
    title  === '' &&
    album  === ''
}

describe('queries reducer', () => {
  const reducer = queries

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

describe('songs reducer', () => {
  const reducer = songSets
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

describe('loading songs reducer', () => {
  const reducer = loadingSongs

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
