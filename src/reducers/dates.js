import { SET_START_DATE, SET_END_DATE } from '../actions'
import { INVALID_DATE } from '../actions'

const initialState = {
  startDate: '',
  endDate:   ''
}

export default (state = initialState, action) => {
  switch (action.type) {
  case SET_START_DATE:
    if (state.endDate === '' || action.date <= state.endDate) {
      return Object.assign({}, state, { startDate: action.date })
    } else {
      return Object.assign({}, state, { startDate: INVALID_DATE })
    }
  case SET_END_DATE:
    if (action.date     === '' ||
        state.startDate === '' ||
        action.date >= state.startDate) {
      return Object.assign({}, state, { endDate: action.date })
    } else {
      return Object.assign({}, state, { endDate: INVALID_DATE })
    }
  default:
    return state
  }
}
