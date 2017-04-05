import React from 'react'
import { connect } from 'react-redux'

const LoadingDisplay = () => <h1>Loading...</h1>

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

const SongDisplay = ({ loadingSongs, songSets }) => {
  if (loadingSongs) {
    return <LoadingDisplay />
  } else {
    return <SongTable songSets={ songSets } />
  }
}

const mapStateToProps = ({ loadingSongs, songSets }) => ({
  loadingSongs, songSets
})

export default connect(mapStateToProps)(SongDisplay)
