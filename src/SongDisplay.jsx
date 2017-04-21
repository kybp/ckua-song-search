import React from 'react'
import { connect } from 'react-redux'
import { selectGroup } from './actions'
import { beginning } from '.'

const onSameDay = (date, otherDate) => (
  date.getFullYear() === otherDate.getFullYear() &&
    date.getMonth() === otherDate.getMonth() &&
    date.getDate() === otherDate.getDate()
)

const startedFromGroup = (group) => group[0]
const matchesFromGroup = (group) => group[1]

const groupByDate = (songSets) => {
  if (songSets.length === 0) return []

  const groups = [[new Date(songSets[0][0].started), songSets[0].slice()]]

  for (let i = 1; i < songSets.length; ++i) {
    const lastGroup   = groups[groups.length - 1]
    const lastStarted = startedFromGroup(lastGroup)
    const thisStarted = new Date(songSets[i][0].started)

    if (onSameDay(thisStarted, lastStarted)) {
      Array.prototype.push.apply(matchesFromGroup(lastGroup), songSets[i])
    } else {
      groups.push([thisStarted, songSets[i].slice()])
    }
  }

  return groups
}

const numberOfDaysBetween = (date1, date2) => {
  const msPerDay = 24 * 60 * 60 * 1000
  return (date2.getTime() - date1.getTime()) / msPerDay
}

const Axes = ({ xMargin, daysInChart, strokeWidth }) => (
  <g>
    <line className="axis" strokeWidth={ strokeWidth }
          x1={ xMargin }               y1="0"
          x2={ xMargin }               y2={ daysInChart } />
    <line className="axis" strokeWidth={ strokeWidth }
          x1={ xMargin }               y1={ daysInChart }
          x2={ daysInChart + xMargin } y2={ daysInChart } />
  </g>
)

/**
 * Return the Y coordinate to chart for the given songCount, scaled
 * appropriately for the chart.
 */
const getY = (songCount, maxCount, daysInChart) => {
  return daysInChart - songCount * daysInChart / (maxCount + 1)
}

const pointsFromGroups = (groups, xMargin, maxCount, daysInChart, dates) => {
  return groups.map(([started, songs]) => {
    const x = xMargin + numberOfDaysBetween(dates.startDate, started)
    const y = getY(songs.length, maxCount, daysInChart)
    return [x, y, songs]
  })
}

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

const getMaxCount = (groups) => (
  Math.max.apply(null, groups.map((group) => (
    matchesFromGroup(group).length
  )))
)

const SongChart = ({ dates, selectedGroup, songSets, dispatch }) => {
  if (songSets.length === 0) return <h1>Empty !</h1>

  const groups      = groupByDate(songSets)
  const dayRange    = numberOfDaysBetween(dates.startDate, dates.endDate)
  const xMargin     = dayRange / 40
  const yMargin     = dayRange / 20
  const strokeWidth = dayRange / 365 / 1.5
  const maxCount    = getMaxCount(groups)
  const points      =
        pointsFromGroups(groups, xMargin, maxCount, dayRange, dates)

  return (
    <div>
      <div className="results-info">
        <span>Total plays in range: { songSets.length }</span>
        <span>Max plays in one day: { maxCount }</span>
      </div>

      <div className="results">
        <svg viewBox={ `0 0 ${dayRange + xMargin * 2} ${dayRange + yMargin}` }
             preserveAspectRatio="none">
          <Axes xMargin={ xMargin } daysInChart={ dayRange }
                strokeWidth={ strokeWidth } />
          <LineChart points={ points } strokeWidth={ strokeWidth } />
          <ScatterPlot points={ points } strokeWidth={ strokeWidth }
                       onClick={ (songs) => dispatch(selectGroup(songs)) } />
        </svg>

        <MatchDetail group={ selectedGroup } />
      </div>
    </div>
  )
}

const formatDate = (date) => (
  date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
)

const MatchDetail = ({ group }) => (
  <ul className="song-list">
    { group.map((song, index) => (
        <li className="song-detail" key={ index }>
          <div className="row">
            <span>{ song.artist }</span>
            <span>{ formatDate(new Date(song.started)) }</span>
          </div>
          <span>{ song.title }</span>
          <span>{ song.album }</span>
        </li>
    ))}
  </ul>
)

const LoadingDisplay = () => <h1>Loading...</h1>

const SongDisplay = ({
  dates, loadingSongs, selectedGroup, songSets, dispatch
}) => {
  if (loadingSongs) {
    return <LoadingDisplay />
  } else {
    return (
      <SongChart songSets={ songSets } selectedGroup={ selectedGroup }
                 dispatch={ dispatch } dates={ dates } />
    )
  }
}

const mapStateToProps = ({
  dates, loadingSongs, selectedGroup, songSets
}) => ({
  dates: {
    startDate: dates.startDate ? new Date(dates.startDate) : beginning,
    endDate:   dates.endDate   ? new Date(dates.endDate)   : new Date()
  },
  selectedGroup: selectedGroup || Array.prototype.concat.apply([], songSets),
  loadingSongs, songSets
})

export default connect(mapStateToProps)(SongDisplay)
