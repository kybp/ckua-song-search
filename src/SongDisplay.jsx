import React from 'react'
import { connect } from 'react-redux'

const dateDaysAfter = (date, delta) => (
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta)
)

const onSameDay = (date, otherDate) => (
  otherDate >= dateDaysAfter(date, 0) && otherDate < dateDaysAfter(date, 1)
)

const groupByDate = (songSets) => {
  if (songSets.length === 0) return []

  const groups = [[new Date(songSets[0][0].started), songSets[0]]]

  for (let i = 1; i < songSets.length; ++i) {
    const lastGroup   = groups[groups.length - 1]
    const lastStarted = lastGroup[0]
    const thisStarted = new Date(songSets[i][0].started)

    if (onSameDay(thisStarted, lastStarted)) {
      lastGroup[1].push(songSets[i])
    } else {
      groups.push([thisStarted, songSets[i]])
    }
  }

  return groups
}

const numberOfDaysBetween = (date1, date2) => {
  const msPerDay = 24 * 60 * 60 * 1000
  return (date2.getTime() - date1.getTime()) / msPerDay
}

const getStartAndEnd = (groups) => {
  const start = groups[groups.length - 1][0]
  const end   = groups[0][0]

  if (numberOfDaysBetween(start, end) === 0) {
    return [dateDaysAfter(start, -1), dateDaysAfter(end, 1)]
  } else {
    return [start, end]
  }
}

const SongChart = ({ songSets }) => {
  if (songSets.length === 0) return <h1>Empty !</h1>

  const groups       = groupByDate(songSets)
  const [start, end] = getStartAndEnd(groups)
  const dayRange     = numberOfDaysBetween(start, end)

  let maxCount = 0
  for (let group of groups) {
    maxCount = Math.max(group[1].length, maxCount)
  }

  const getY = (songCount) => dayRange - songCount * dayRange / (maxCount + 1)
  const noPlays = getY(0)

  const points = groups.map(([started, songs]) => {
    const x = numberOfDaysBetween(start, started)
    const y = getY(songs.length)
    return `${x - 0.1},${noPlays} ${x},${y} ${x + 0.1},${noPlays}`
  }).join(' ')

  return (
    <div>
      <h1>
        Charting from { start.toString() } to { end.toString() }
      </h1>
      <h2>
        Max plays in one day: { maxCount }
      </h2>
      <svg style={{ backgroundColor: 'steelblue', width: 700, height: 300 }}
           viewBox={ `0 0 ${dayRange} ${dayRange}` }
           preserveAspectRatio="none">
        <polyline fill="none" stroke="lightgreen"
                  strokeWidth={ dayRange / 365 / 1.5 }
                  points={ points } />
      </svg>
    </div>
  )
}

const SongTable = ({ songSets }) => (
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
      <tr><td colSpan="4"></td></tr>
      { songSets.map((songSet, setIndex) => (
          songSet.map((song, songIndex) => ([
            <tr key={ `song-${setIndex}-${songIndex}` }>
              <td>{ song.artist }</td>
              <td>{ song.title }</td>
              <td>{ song.album }</td>
              <td>{ song.started }</td>
            </tr>,
            songIndex + 1 === songSet.length
            ? <tr className="empty-row"><td colSpan="4"></td></tr>
            : null
          ]))
        ))}
    </tbody>
  </table>
)

const LoadingDisplay = () => <h1>Loading...</h1>

const SongDisplay = ({ loadingSongs, songSets }) => {
  if (loadingSongs) {
    return <LoadingDisplay />
  } else {
    return <SongChart songSets={ songSets }/>
  }
}

const mapStateToProps = ({ loadingSongs, songSets }) => ({
  loadingSongs, songSets
})

export default connect(mapStateToProps)(SongDisplay)
