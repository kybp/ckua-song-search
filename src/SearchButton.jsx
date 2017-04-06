import React, { Component } from 'react'
import { connect } from 'react-redux'
import { addSongSets, resetSongSets } from './actions'
import { startLoadingSongs, finishLoadingSongs } from './actions'

class SearchButton extends Component {
  handleSubmit() {
    const queryString = this.props.queries.map((query) => (
      Object
        .keys(query)
        .map((key) => {
          if (key === 'id') return `${key}=${query[key]}`
          else return (
            `${key}=${encodeURIComponent(query[key].text)}&` +
            `${key}-lockLeft=${query[key].lockLeft}&` +
            `${key}-lockRight=${query[key].lockRight}`)
        }).join('&')
    )).join('&')

    this.props.dispatch(startLoadingSongs())
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        this.props.dispatch(finishLoadingSongs())
        const json = JSON.parse(xhr.response)
        if (xhr.status === 200) {
          this.props.dispatch(resetSongSets())
          this.props.dispatch(addSongSets(json))
        } else {
          alert(json.error)
        }
      }
    }
    xhr.open('GET', 'http://localhost:5000/search?' + queryString)
    xhr.send()
  }

  render() {
    return (
      <button onClick={ this.handleSubmit.bind(this) }>Search</button>
    )
  }
}

const mapStateToProps = ({ queries }) => ({ queries })

export default connect(mapStateToProps)(SearchButton)
