import React from 'react'
import { connect } from 'react-redux'
import { beginning } from '.'
import { selectGroup } from './actions'
import './song-chart.css'

const numberOfDaysBetween = (date1, date2) => {
  const msPerDay = 24 * 60 * 60 * 1000
  return (date2.getTime() - date1.getTime()) / msPerDay
}

const pointsFromGroups = (groups, maxCount, msInChart, dates) => {
  /**
   * Return the Y coordinate to chart for the given songCount, scaled
   * appropriately for the chart.
   */
  const getY = (songCount, maxCount, msInChart) => {
    return msInChart - songCount * msInChart / (maxCount + 1)
  }

  return groups.map(([started, songs]) => {
    const x = numberOfDaysBetween(dates.startDate, started)
    const y = getY(songs.length, maxCount, msInChart)
    return [x, y, songs]
  })
}

const Axes = ({ msInChart, strokeWidth }) => (
  <g className="axes">
    <line strokeWidth={ strokeWidth }
          x1="0"           y1="0"
          x2="0"           y2={ msInChart } />
    <line strokeWidth={ strokeWidth }
          x1="0"           y1={ msInChart }
          x2={ msInChart } y2={ msInChart } />
  </g>
)

const LineChart = ({ dates, points, strokeWidth }) => (
  <polyline className="line-chart" strokeWidth={ strokeWidth }
            points={ points.map(([x, y]) => `${x},${y}`).join(' ') } />
)

const ScatterPlot = ({ onClick, points, strokeWidth }) => {
  const rx = strokeWidth * 3
  const ry = rx * 2

  return (
    <g className="scatter-plot">
      { points.map(([x, y, songs], index) => (
          <ellipse className="scatter-point"
                   cx={ x } cy={ y } rx={ rx } ry={ ry } key={ index }
                   onClick={ () => onClick(songs) } />
        ))}
    </g>
  )
}

const SongChart = ({ dates, dispatch, groups, maxCount }) => {
  const msInChart   = numberOfDaysBetween(dates.startDate, dates.endDate)
  const strokeWidth = msInChart / 365
  const points      = pointsFromGroups(groups, maxCount, msInChart, dates)

  return (
    <svg viewBox={ `0 0 ${msInChart} ${msInChart}` }
         preserveAspectRatio="none" className="song-chart">
      <Axes msInChart={ msInChart } strokeWidth={ strokeWidth } />
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
