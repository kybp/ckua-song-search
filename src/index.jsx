import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import SearchForm from './SearchForm'
import reducer from './reducers'

render(
  <Provider store={ createStore(reducer) }>
    <SearchForm />
  </Provider>,
  document.getElementById('root'))
