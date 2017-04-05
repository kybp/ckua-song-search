import React, { Component } from 'react'
import { connect } from 'react-redux'
import { changeQuery, deleteQuery } from './actions'

class SearchQuery extends Component {
  handleChangeFor(field) {
    return (event) => {
      const { artist, title, album } = this.props
      this.props.dispatch(changeQuery(Object.assign({
        id: this.props.queryId,
        artist, title, album
      }, { [field]: event.target.value })))
    }
  }

  deleteButton() {
    const submitDelete = () => {
      this.props.dispatch(deleteQuery(this.props.queryId))
    }

    if (this.props.deletable) {
      return <button onClick={ submitDelete.bind(this) }>&times;</button>
    }
  }

  render() {
    const { artist, title, album } = this.props
    const handleChangeFor = this.handleChangeFor.bind(this)

    return (
      <p>
        <input type="text" placeholder="artist"
               value={ artist } onChange={ handleChangeFor('artist') } />
        <input type="text" placeholder="title"
               value={ title } onChange={ handleChangeFor('title') } />
        <input type="text" placeholder="album"
               value={ album } onChange={ handleChangeFor('album') } />
        { this.deleteButton() }
      </p>
    )
  }
}

const mapStateToProps = ({ queries }, { queryId }) => {
  const query = queries.filter((query) => query.id === queryId)[0]
  if (query === undefined) {
    throw Error(
      `SearchQuery::mapStateToProps: id not found in store: ${queryId}`)
  }

  return query
}

export default connect(mapStateToProps)(SearchQuery)
