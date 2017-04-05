import React from 'react'
import { connect } from 'react-redux'
import { addQuery } from './actions'

const AddQueryButton = ({ dispatch }) => (
  <button onClick={ () => dispatch(addQuery()) }>+</button>
)

export default connect()(AddQueryButton)
