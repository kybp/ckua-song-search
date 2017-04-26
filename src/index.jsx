import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import reducer from './reducers'
import App from './App'

export const beginning = new Date(2014, 6, 5)

export const getQueryString = ({ queries, startDate, endDate }) => (
  queries
    .map((query) => [query.id, query])
    .map(([id, query]) => `id=${id}` + Object
      .keys(query)
      .filter((key) => query[key].text)
      .map((key) => {
        if (query[key].text) return (
          `&${key}=${encodeURIComponent(query[key].text)}&` +
          `${key}-lockLeft=${query[key].lockLeft}&` +
          `${key}-lockRight=${query[key].lockRight}`)
      }).join('&')
    ).join('&') + `&start=${startDate}&end=${endDate}`
)

render(
  <Provider store={ createStore(reducer) }>
    <App />
  </Provider>,
  document.getElementById('root'))
