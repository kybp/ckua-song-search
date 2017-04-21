import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import SearchForm from './SearchForm'
import SearchResults from './SearchResults'
import reducer from './reducers'

export const beginning = new Date(2014, 6, 5)

const Info = () => (
  <div className="info">
    <span className="title">CKUA Song Search</span>
    <p>
      Search CKUA's playlists back to 2014. The "L" buttons on search fields can
      "lock in" the beginning/end of each field. You can click on points in the
      chart to only display the matching songs for that day.
    </p>
  </div>
)

render(
  <Provider store={ createStore(reducer) }>
    <div>
      <header>
        <Info />
        <SearchForm />
      </header>
      <SearchResults />
    </div>
  </Provider>,
  document.getElementById('root'))
