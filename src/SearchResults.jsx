import React from 'react'
import { connect } from 'react-redux'
import SongChart from './SongChart'
import './search-results.css'

const onSameDay = (date, otherDate) => (
  date.getFullYear() === otherDate.getFullYear() &&
    date.getMonth()  === otherDate.getMonth()    &&
    date.getDate()   === otherDate.getDate()
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

const getMaxCount = (groups) => (
  groups.length === 0 ? 0 : Math.max.apply(null, groups.map((group) => (
    matchesFromGroup(group).length
  )))
)

const ResultsInfo = ({ totalMatches, maxInOneDay, numberOfQueries }) => (
  <div className="results-info">
    <span>Total matches in range: { totalMatches }</span>
    <span>Max matches in one day:
      { numberOfQueries === 0 ? 0 : maxInOneDay / numberOfQueries }
    </span>
  </div>
)

const SongList = ({ group }) => {
  const formatDate = (date) => (
    date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  )

  return (
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
}

const SearchResults = ({ loadingSongs, queries, selectedGroup, songSets }) => {
  if (loadingSongs) return <h1>Loading...</h1>

  const groups          = groupByDate(songSets)
  const maxCount        = getMaxCount(groups)
  const numberOfQueries = songSets.length > 0 ? songSets[0].length : 0

  return (
    <div>
      <ResultsInfo totalMatches={ songSets.length }
                   maxInOneDay={ maxCount }
                   numberOfQueries={ numberOfQueries } />
      <div className="search-results">
        <SongChart groups={ groups } maxCount={ maxCount } />
        <SongList group={ selectedGroup } />
      </div>
    </div>
  )
}

const mapStateToProps = ({
  loadingSongs, queries, selectedGroup, songSets
}) => ({
  selectedGroup: selectedGroup || Array.prototype.concat.apply([], songSets),
  loadingSongs, songSets
})

export default connect(mapStateToProps)(SearchResults)
