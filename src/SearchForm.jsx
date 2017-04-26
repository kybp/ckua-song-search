import React, { Component } from 'react'
import { connect } from 'react-redux'
import AddQueryButton from './AddQueryButton'
import DateSelector from './DateSelector'
import SearchButton from './SearchButton'
import SearchQuery from './SearchQuery'
import { setStartDate, setEndDate } from './actions'

const SearchForm = ({ queries, startDate, endDate, dispatch }) => (
  <div className="search-form">
    <div className="range-selector">
      <DateSelector
          label="Start date" value={ startDate }
          onSelect={ (date) => dispatch(setStartDate(date)) } />
      <DateSelector
          label="End date" value={ endDate }
          onSelect={ (date) => dispatch(setEndDate(date)) } />
    </div>
    { queries.map((query, index) => (
        <div key={ query.id }>
          <SearchQuery deletable={ queries.length > 1 } queryId={ query.id } />
        </div>
      )) }
    <div className="controls">
      <AddQueryButton />
      <SearchButton   />
    </div>
  </div>
)

const mapStateToProps = ({ queries, dates }) => ({
  startDate: dates.startDate,
  endDate:   dates.endDate,
  queries
})

export default connect(mapStateToProps)(SearchForm)
