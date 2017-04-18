import React, { Component } from 'react'
import { connect } from 'react-redux'
import { changeQuery, deleteQuery, toggleQueryLock } from './actions'

const QueryField = ({ name, value, onChange, toggleLock }) => (
  <div className="query-field">
    <button className={ 'lock-button ' +
                        (value.lockLeft ? 'locked' : 'unlocked') }
            onClick={ toggleLock(name, 'left') }>
      L
    </button>
    <input type="text" placeholder={ name } value={ value.text }
           onChange={ onChange }/>
    <button className={ 'lock-button ' +
                        (value.lockRight ? 'locked' : 'unlocked') }
            onClick={ toggleLock(name, 'right') }>
      L
    </button>
  </div>
)

class SearchQuery extends Component {
  handleChangeFor(field) {
    return (event) => {
      const { artist, title, album } = this.props
      this.props.dispatch(changeQuery(Object.assign({
        id: this.props.queryId,
        artist, title, album
      }, { [field]: Object.assign({}, this.props[field], {
        text: event.target.value
      })})))
    }
  }

  deleteButton() {
    const submitDelete = () => {
      this.props.dispatch(deleteQuery(this.props.queryId))
    }

    if (this.props.deletable) {
      return <button className="delete-query-button"
                     onClick={ submitDelete.bind(this) }>&times;</button>
    }
  }

  render() {
    const handleChangeFor = this.handleChangeFor.bind(this)
    const toggleLock = (name, side) => () => {
      this.props.dispatch(toggleQueryLock(this.props.id, name, side))
    }

    return (
      <div className="query-form">
        <QueryField name="artist" value={ this.props.artist }
                    onChange={ handleChangeFor('artist') }
                    toggleLock={ toggleLock } />
        <QueryField name="title" value={ this.props.title }
                    onChange={ handleChangeFor('title') }
                    toggleLock={ toggleLock } />
        <QueryField name="album" value={ this.props.album }
                    onChange={ handleChangeFor('album') }
                    toggleLock={ toggleLock } />
        { this.deleteButton() }
      </div>
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
