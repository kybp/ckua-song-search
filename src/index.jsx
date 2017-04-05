import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import SearchForm from './SearchForm'
import SongDisplay from './SongDisplay'
import reducer from './reducers'

render(
  <Provider store={ createStore(reducer) }>
    <div>
      <SearchForm />
      <SongDisplay />
    </div>
  </Provider>,
  document.getElementById('root'))
