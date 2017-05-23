import React, { Component } from 'react'
import { connect } from 'react-redux'
import { addSongSets, resetSongSets } from './actions'
import { startLoadingSongs, finishLoadingSongs } from './actions'
import { getQueryString } from '.'

export const submitSearch = (state, dispatch) => {
  dispatch(startLoadingSongs())

  const xhr = new XMLHttpRequest()
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      const json = JSON.parse(xhr.response)

      if (xhr.status === 200) {
        dispatch(resetSongSets())
        dispatch(addSongSets(json))
        dispatch(finishLoadingSongs())
      } else {
        alert(json.error)
      }
    }
  }
  xhr.open('GET', `http://localhost:5000/search?${getQueryString(state)}`)
  xhr.send()
}

class SearchButton extends Component {
  handleSubmit() {
    const { queries, songSets, startDate, endDate } = this.props
    submitSearch({ queries, songSets, startDate, endDate },
                 this.props.dispatch)
  }

  render() {
    return (
      <button className="search-button"
              onClick={ this.handleSubmit.bind(this) }>
        Search
      </button>
    )
  }
}

const mapStateToProps = ({ dates, queries, songSets }) => ({
  startDate: dates.startDate,
  endDate:   dates.endDate,
  queries, songSets
})

export default connect(mapStateToProps)(SearchButton)
