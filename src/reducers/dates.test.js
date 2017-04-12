import { assert } from 'chai'
import { setStartDate, SET_START_DATE } from '../actions'
import { setEndDate,   SET_END_DATE   } from '../actions'
import { INVALID_DATE } from '../actions'
import reducer from './dates'

describe('dates reducer', () => {
  describe('initial state', () => {
    const initial = reducer(undefined, { type: 'INIT' })

    it('has the empty string for a start date', () => {
      assert.strictEqual(initial.startDate, '')
    })

    it('has the empty string for an end date', () => {
      assert.strictEqual(initial.endDate, '')
    })
  })

  describe(SET_START_DATE, () => {
    it('always lets you clear the end date', () => {
      const startDate = '2016-04-11'

      for (let i = 10; i < 13; ++i) {
        const initial = { startDate, endDate: '2016-04-' + i }
        const updated = reducer(initial, setStartDate(''))
        assert.strictEqual(updated.startDate, '')
      }
    })

    describe('when the end date is the empty string', () => {
      it('sets the start date', () => {
        const initial = { startDate: '', endDate: '' }
        const date    = '2016-04-11'
        const updated = reducer(initial, setStartDate(date))
        assert.strictEqual(updated.startDate, date)
      })
    })

    describe('when the end date is later than the start date', () => {
      it('sets the start date', () => {
        const initial = { startDate: '', endDate: '2017-04-11' }
        const date    = '2016-04-11'
        const updated = reducer(initial, setStartDate(date))
        assert.strictEqual(updated.startDate, date)
      })
    })

    describe('when the end date is equal to the start date', () => {
      it('sets the start date', () => {
        const date    = '2016-04-11'
        const initial = { startDate: '', endDate: date }
        const updated = reducer(initial, setStartDate(date))
        assert.strictEqual(updated.startDate, date)
      })
    })

    describe('when the end date is earlier than the start date', () => {
      it('sets the start date to ' + INVALID_DATE, () => {
        const oldStartDate = '2015-04-11'
        const newStartDate = '2016-04-11'
        const initial = { startDate: oldStartDate, endDate: oldStartDate}
        const updated = reducer(initial, setStartDate(newStartDate))
        assert.strictEqual(updated.startDate, INVALID_DATE)
      })
    })
  })

  describe(SET_END_DATE, () => {
    it('always lets you clear the end date', () => {
      const endDate = '2016-04-11'

      for (let i = 10; i < 13; ++i) {
        const initial = { startDate: '2016-04-' + i, endDate }
        const updated = reducer(initial, setEndDate(''))
        assert.strictEqual(updated.endDate, '')
      }
    })

    describe('when the start date is the empty string', () => {
      it('sets the end date', () => {
        const initial = { startDate: '', endDate: '' }
        const date    = '2016-04-11'
        const updated = reducer(initial, setEndDate(date))
        assert.strictEqual(updated.endDate, date)
      })
    })

    describe('when the start date is earlier than the end date', () => {
      it('sets the end date', () => {
        const initial = { startDate: '', endDate: '2016-04-11' }
        const date    = '2017-04-11'
        const updated = reducer(initial, setEndDate(date))
        assert.strictEqual(updated.endDate, date)
      })
    })

    describe('when the start date is equal to the end date', () => {
      it('sets the end date', () => {
        const date    = '2016-04-11'
        const initial = { startDate: '', endDate: date }
        const updated = reducer(initial, setEndDate(date))
        assert.strictEqual(updated.endDate, date)
      })
    })

    describe('when the start date is later than the end date', () => {
      it('sets the end date to ' + INVALID_DATE, () => {
        const oldEndDate = '2016-04-11'
        const newEndDate = '2016-04-10'
        const initial    = { startDate: oldEndDate, endDate: oldEndDate}
        const updated    = reducer(initial, setEndDate(newEndDate))
        assert.strictEqual(updated.endDate, INVALID_DATE)
      })
    })
  })
})
