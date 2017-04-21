import React from 'react'
import { connect } from 'react-redux'
import { beginning } from '.'
import { selectGroup } from './actions'

const numberOfDaysBetween = (date1, date2) => {
  const msPerDay = 24 * 60 * 60 * 1000
  return (date2.getTime() - date1.getTime()) / msPerDay
}

const pointsFromGroups = (groups, maxCount, daysInChart, dates) => {
  /**
   * Return the Y coordinate to chart for the given songCount, scaled
   * appropriately for the chart.
   */
  const getY = (songCount, maxCount, daysInChart) => {
    return daysInChart - songCount * daysInChart / (maxCount + 1)
  }

  return groups.map(([started, songs]) => {
    const x = numberOfDaysBetween(dates.startDate, started)
    const y = getY(songs.length, maxCount, daysInChart)
    return [x, y, songs]
  })
}

const Axes = ({ daysInChart, strokeWidth }) => (
  <g>
    <line className="axis" strokeWidth={ strokeWidth }
          x1="0"             y1="0"
          x2="0"             y2={ daysInChart } />
    <line className="axis" strokeWidth={ strokeWidth }
          x1="0"             y1={ daysInChart }
          x2={ daysInChart } y2={ daysInChart } />
  </g>
)

const LineChart = ({ dates, points, strokeWidth }) => (
  <polyline points={ points.map(([x, y]) => `${x},${y}`).join(' ') }
            strokeWidth={ strokeWidth } />
)

const ScatterPlot = ({ onClick, points, strokeWidth }) => {
  const r = strokeWidth * 3

  return (
    <g>
      { points.map(([x, y, songs], index) => (
          <circle cx={ x } cy={ y } r={ r } key={ index }
                  onClick={ () => onClick(songs) } />
        ))}
    </g>
  )
}

const SongChart = ({ dates, dispatch, groups, maxCount }) => {
  const daysInChart = numberOfDaysBetween(dates.startDate, dates.endDate)
  const strokeWidth = daysInChart / 365 / 1.5
  const points      = pointsFromGroups(groups, maxCount, daysInChart, dates)

  return (
    <svg viewBox={ `0 0 ${daysInChart} ${daysInChart}` }
         preserveAspectRatio="none">
      <Axes daysInChart={ daysInChart } strokeWidth={ strokeWidth } />
      <LineChart points={ points } strokeWidth={ strokeWidth } />
      <ScatterPlot points={ points } strokeWidth={ strokeWidth }
                   onClick={ (songs) => dispatch(selectGroup(songs)) } />
    </svg>
  )
}

const mapStateToProps = ({ dates }) => ({
  dates: {
    startDate: dates.startDate ? new Date(dates.startDate) : beginning,
    endDate:   dates.endDate   ? new Date(dates.endDate)   : new Date()
  }
})

export default connect(mapStateToProps)(SongChart)
