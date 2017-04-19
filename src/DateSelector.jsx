import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import $ from 'jquery'
import 'pickadate/lib/picker'
import 'pickadate/lib/picker.date'
import 'pickadate/lib/themes/default.css'
import 'pickadate/lib/themes/default.date.css'
import { INVALID_DATE } from './actions'
import { beginning } from '.'

const format = 'yyyy-mm-dd'

class DateSelector extends Component {
  componentDidMount() {
    const component = this

    $(findDOMNode(this.refs.datepicker)).pickadate({
      min:          beginning,
      max:          -1,
      today:        false,
      format:       format,
      formatSubmit: format,
      selectMonths: true,
      selectYears:  true,
      onSet: function(action) {
        if ('select' in action || 'clear' in action) {
          component.props.onSelect(this.get('select', format))
        }
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    const picker = $(findDOMNode(this.refs.datepicker))
      .pickadate().pickadate('picker')
    if (nextProps.value === INVALID_DATE) {
      picker.set('select', this.props.value)
      this.props.onSelect(this.props.value)
      alert('That date was invalid')
    }
  }

  render() {
    return (
      <div className="date-selector">
        <label>{ this.props.label }</label>
        <input type="date" ref="datepicker" value={ this.props.value } />
      </div>
    )
  }
}

export default DateSelector
