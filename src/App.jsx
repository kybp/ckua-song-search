import React, { Component } from 'react'
import { connect } from 'react-redux'
import SearchForm from './SearchForm'
import SearchResults from './SearchResults'
import { addQuery, deleteQuery } from './actions'
import { addSongSets, resetSongSets } from './actions'
import { setStartDate, setEndDate, resetDates } from './actions'
import { submitSearch } from './SearchButton'
import { getQueryString } from '.'

const Info = () => (
  <div className="info">
    <span className="title">CKUA Song Search</span>
    <p>
      Search CKUA's playlists back to 2014. The "L" buttons on search fields can
      "lock in" the beginning/end of each field. You can click on points in the
      chart to only display the matching songs for that day.
    </p>
  </div>
)

const splitParam = (queryParam) => {
  const [paramName, value] = queryParam.split('=')
  return [paramName, decodeURIComponent(value)]
}

const getQueryParams = () => (
  window.location.search.substring(1).split('&')
)

const getQueries = () => {
  const result = []
  let   query  = {}

  for (let queryParam of getQueryParams()) {
    const [paramName, value] = splitParam(queryParam)

    if (paramName === 'start' || paramName === 'end') {
      continue
    } else if (paramName === 'id') {
      if (Object.keys(query).length > 0) result.push(query)
      query = { id: value }
    } else {
      query[paramName] = value
    }
  }

  if (Object.keys(query).length > 0) result.push(query)

  return result
}

const getStartAndEnd = () => {
  let startDate = ''
  let endDate   = ''

  for (let queryParam of getQueryParams()) {
    const [paramName, value] = splitParam(queryParam)
    if (paramName === 'start') startDate = value
    if (paramName === 'end')   endDate   = value
  }

  return [startDate, endDate]
}

const tryReadLock = (parsedQuery, unparsedQuery, key, field, side) => {
  const lockName = 'lock' + side

  if (key === field + '-' + lockName) {
    parsedQuery[field][lockName] = unparsedQuery[key].toLowerCase() === 'true'
    return true
  }

  return false
}

const parseQuery = (unparsedQuery) => {
  const parsedQuery = {
    artist: { text: '' },
    title:  { text: '' },
    album:  { text: '' }
  }
  const fields = Object.keys(parsedQuery)
  parsedQuery.id = unparsedQuery.id

  for (let key of Object.keys(unparsedQuery)) {
    if (fields.some(field => field === key)) {
      parsedQuery[key].text = unparsedQuery[key]
      continue
    }

    for (let field of fields) {
      if (tryReadLock(parsedQuery, unparsedQuery, key, field, 'Left')) {
        break
      }
      if (tryReadLock(parsedQuery, unparsedQuery, key, field, 'Right')) {
        break
      }
    }
  }

  return parsedQuery
}

class App extends Component {
  componentWillReceiveProps(props) {
    if (this.props.loadingSongs && ! props.loadingSongs) {
      const state = {
        queries:   props.queries,
        songSets:  props.songSets,
        startDate: props.dates.startDate,
        endDate:   props.dates.endDate
      }
      window.history.pushState(state, '', `?${getQueryString(state)}`)
    }
  }

  populateStoreFromQueryString() {
    if (window.location.search.length === 0) {
      this.props.dispatch(addQuery())
    } else {
      const queries = getQueries().map(parseQuery)
      const [startDate, endDate] = getStartAndEnd()
      this.props.dispatch(setStartDate(startDate))
      this.props.dispatch(setEndDate(endDate))
      queries.forEach((query) => this.props.dispatch(addQuery(query)))
      submitSearch({ songSets: this.props.songSets,
                     queries, startDate, endDate },
                   this.props.dispatch)
    }
  }

  componentWillMount() {
    const populateStoreFromState = (state) => {
      if (state === null) return

      for (let query of this.props.queries) {
        this.props.dispatch(deleteQuery(query.id))
      }
      this.props.dispatch(resetSongSets())
      this.props.dispatch(resetDates())

      if (state.queries.length > 0) {
        for (let query of state.queries) {
          this.props.dispatch(addQuery(query))
        }
      }

      if (state.songSets)  this.props.dispatch(addSongSets(state.songSets))
      if (state.startDate) this.props.dispatch(setStartDate(state.startDate))
      if (state.endDate)   this.props.dispatch(setEndDate(state.endDate))
    }

    window.onpopstate = (event) => populateStoreFromState(event.state)
    if (history.state) {
      populateStoreFromState(history.state)
    } else {
      this.populateStoreFromQueryString()
    }
  }

  render() {
    return (
      <div>
        <header>
          <Info />
          <SearchForm />
        </header>
        <SearchResults />
      </div>
    )
  }
}

const mapStateToProps = ({ dates, loadingSongs, songSets, queries }) => ({
  dates, loadingSongs, queries, songSets
})

export default connect(mapStateToProps)(App)
