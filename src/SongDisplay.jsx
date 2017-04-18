import React from 'react'
import { connect } from 'react-redux'
import { selectGroup } from './actions'

const dateDaysAfter = (date, delta) => (
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta)
)

const onSameDay = (date, otherDate) => (
  otherDate >= dateDaysAfter(date, 0) && otherDate < dateDaysAfter(date, 1)
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

const getStartAndEnd = (groups) => {
  const start = startedFromGroup(groups[groups.length - 1])
  const end   = startedFromGroup(groups[0])

  if (numberOfDaysBetween(start, end) === 0) {
    return [dateDaysAfter(start, -1), dateDaysAfter(end, 1)]
  } else {
    return [start, end]
  }
}

const Axes = ({ xMargin, daysInChart, strokeWidth }) => (
  <g>
    <line stroke="black" strokeWidth={ strokeWidth }
          x1={ xMargin }               y1="0"
          x2={ xMargin }               y2={ daysInChart } />
    <line stroke="black" strokeWidth={ strokeWidth }
          x1={ xMargin }               y1={ daysInChart }
          x2={ daysInChart + xMargin } y2={ daysInChart } />
  </g>
)

/**
 * The omount of 'spread' to add around each side of a point on the chart to
 * smooth the line chart. The X coordinate as calculated is used as a base
 * point xSpread to the left, the point itself is drawn at x + xSpread, and the
 * line is drawn to another base point xSpread to the right.
 */
const xSpread = 0.1

/**
 * Return the Y coordinate to chart for the given songCount, scaled
 * appropriately for the chart.
 */
const getY = (songCount, maxCount, daysInChart) => {
  return daysInChart - songCount * daysInChart / (maxCount + 1)
}

const pointsFromGroups = (groups, xMargin, maxCount, daysInChart) => {
  const [start, _] = getStartAndEnd(groups)

  return groups.map(([started, songs]) => {
    const x = xMargin + xSpread + numberOfDaysBetween(start, started)
    const y = getY(songs.length, maxCount, daysInChart)
    return [x, y, songs]
  })
}

const lineChartPoints = (points, zeroPlays) => {
  return points.map(([x, y]) => (
    `${x - xSpread},${zeroPlays} ${x},${y} ${x + xSpread},${zeroPlays}`
  )).join(' ')
}

const LineChart = ({ points, strokeWidth }) => (
  <polyline fill="orange" stroke="orange"
            strokeWidth={ strokeWidth }
            points={ points } />
)

const ScatterPlot = ({ points, strokeWidth, onClick }) => {
  const r = strokeWidth * 3

  return (
    <g>
      { points.map(([x, y, songs], index) => (
          <circle cx={ x } cy={ y } r={ r } fill="red" key={ index }
                  onClick={ () => onClick(songs) } />
        ))}
    </g>
  )
}

const getMaxCount = (groups) => {
  let maxCount = 0

  for (let group of groups) {
    maxCount = Math.max(matchesFromGroup(group).length, maxCount)
  }

  return maxCount
}

const SongChart = ({ selectedGroup, songSets, dispatch }) => {
  if (songSets.length === 0) return <h1>Empty !</h1>

  const groups       = groupByDate(songSets)
  const [start, end] = getStartAndEnd(groups)
  const dayRange     = numberOfDaysBetween(start, end)
  const xMargin      = dayRange / 20
  const yMargin      = dayRange / 10
  const strokeWidth  = dayRange / 365 / 1.5
  const maxCount     = getMaxCount(groups)
  const zeroPlays    = getY(0, maxCount, dayRange)
  const points       = pointsFromGroups(groups, xMargin, maxCount, dayRange)

  return (
    <div>
      <h2>
        Charting from { start.toString() } to { end.toString() }
      </h2>
      <h2>Total plays: { songSets.length }</h2>
      <h2>Max plays in one day: { maxCount }</h2>

      <GroupTable group={ selectedGroup } />

      <svg style={{ backgroundColor: 'lightblue', width: 700, height: 700 }}
           viewBox={ `0 0 ${dayRange + xMargin + xSpread * 2} ` +
                     (dayRange + yMargin) }
           preserveAspectRatio="none">
        <Axes xMargin={ xMargin } daysInChart={ dayRange }
              strokeWidth={ strokeWidth } />
        <LineChart points={ lineChartPoints(points, zeroPlays) }
                   strokeWidth={ strokeWidth } />
        <ScatterPlot points={ points } strokeWidth={ strokeWidth }
                     onClick={ (songs) => dispatch(selectGroup(songs)) } />
      </svg>
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

const SongDisplay = ({ loadingSongs, selectedGroup, songSets, dispatch }) => {
  if (loadingSongs) {
    return <LoadingDisplay />
  } else {
    return (
      <SongChart songSets={ songSets } selectedGroup={ selectedGroup }
                 dispatch={ dispatch } />
    )
  }
}

const mapStateToProps = ({ loadingSongs, selectedGroup, songSets }) => ({
  loadingSongs, selectedGroup, songSets
})

export default connect(mapStateToProps)(SongDisplay)
