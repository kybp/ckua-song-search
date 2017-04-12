import React, { Component } from 'react'
import { connect } from 'react-redux'
import AddQueryButton from './AddQueryButton'
import DateSelector from './DateSelector'
import SearchButton from './SearchButton'
import SearchQuery from './SearchQuery'
import { addQuery, setStartDate, setEndDate } from './actions'

class SearchForm extends Component {
  componentWillMount() {
    const queryParams = window.location.search.substring(1).split('&')
    let songQuery = {}

    const saveQuery = () => {
      this.props.dispatch(addQuery(songQuery))
      songQuery = {}
    }

    for (let i = 0; i < queryParams.length; ++i) {
      const [paramName, value] = queryParams[i].split('=')
      if (paramName in songQuery) {
        saveQuery()
      }
      if (['artist', 'title', 'album'].includes(paramName)) {
        songQuery[paramName] = decodeURIComponent(value)
      }
    }

    // This is either the left-over data from the last-parsed song query, or an
    // empty initial song query
    saveQuery()
  }

  render() {
    return (
      <div>
        <p>Start date:
          <DateSelector value={ this.props.startDate }
                        onSelect={ (date) => {
                            this.props.dispatch(setStartDate(date))
                          } }/>
        </p>
        <p>End date:
          <DateSelector value={ this.props.endDate }
                        onSelect={ (date) => {
                            this.props.dispatch(setEndDate(date))
                          } }/>
        </p>
        { this.props.queries.map((query, index) => (
            <div key={ query.id }>
              <SearchQuery deletable={ this.props.queries.length > 1 }
                           queryId={ query.id } />
              { index + 1 == this.props.queries.length
                ? <AddQueryButton />
                : undefined }
            </div>
          )) }
        <SearchButton />
      </div>
    )
  }
}

const mapStateToProps = ({ queries, dates }) => ({
  startDate: dates.startDate,
  endDate:   dates.endDate,
  queries
})

export default connect(mapStateToProps)(SearchForm)
