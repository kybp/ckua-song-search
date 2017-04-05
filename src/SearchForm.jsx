import React from 'react'
import { connect } from 'react-redux'
import AddQueryButton from './AddQueryButton'
import SearchQuery from './SearchQuery'

const SearchForm = ({ queries }) => (
  <div>
    { queries.map((query, index) => (
        <div key={ query.id }>
          <SearchQuery deletable={ queries.length > 1 }
                       queryId={ query.id } />
          { index + 1 == queries.length
            ? <AddQueryButton />
            : undefined }
        </div>
      )) }
  </div>
)

const mapStateToProps = ({ queries }) => ({ queries })

export default connect(mapStateToProps)(SearchForm)
