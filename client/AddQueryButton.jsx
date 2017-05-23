import React from 'react'
import { connect } from 'react-redux'
import { addQuery } from './actions'

const AddQueryButton = ({ dispatch }) => (
  <button className="add-query-button" onClick={ () => dispatch(addQuery()) }>
    Add song
  </button>
)

export default connect()(AddQueryButton)
