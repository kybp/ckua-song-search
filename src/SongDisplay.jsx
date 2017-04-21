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
  const xMargin     = dayRange / 20
  const yMargin     = dayRange / 10
  const strokeWidth = dayRange / 365 / 1.5
  const maxCount    = getMaxCount(groups)
  const points      =
        pointsFromGroups(groups, xMargin, maxCount, dayRange, dates)

  return (
    <div>
      <h2>
        Charting
        from { dates.startDate.toString() } to { dates.endDate.toString() }
      </h2>
      <h2>Total plays: { songSets.length }</h2>
      <h2>Max plays in one day: { maxCount }</h2>

      <svg viewBox={ `0 0 ${dayRange + xMargin * 2} ` +
                     (dayRange + yMargin) }
           preserveAspectRatio="none">
        <Axes xMargin={ xMargin } daysInChart={ dayRange }
              strokeWidth={ strokeWidth } />
        <LineChart points={ points } strokeWidth={ strokeWidth } />
        <ScatterPlot points={ points } strokeWidth={ strokeWidth }
                     onClick={ (songs) => dispatch(selectGroup(songs)) } />
      </svg>

      <GroupTable group={ selectedGroup } />
    </div>
  )
}

const GroupTable = ({ group }) => {
  if (group === null) return null

  return (
    <table>
      <thead>
        <tr>
          <th>Artist</th>
          <th>Title</th>
          <th>Album</th>
          <th>Played At</th>
        </tr>
      </thead>
      <tbody>
        { group.map((song, index) => (
            <tr key={ index }>
              <td>{ song.artist  }</td>
              <td>{ song.title   }</td>
              <td>{ song.album   }</td>
              <td>{ song.started }</td>
            </tr>
          ))
        }
      </tbody>
    </table>
  )
}

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
  }, loadingSongs, selectedGroup, songSets
})

export default connect(mapStateToProps)(SongDisplay)
