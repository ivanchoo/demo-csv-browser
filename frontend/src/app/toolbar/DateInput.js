import React from "react";
import PropTypes from "prop-types";
import { randomId, noop } from "../utils";
import m from "moment";

const FORMAT = "DD/MM/YYYY";
const fromValue = value => m(value, FORMAT).toDate();
const match = new RegExp(
  FORMAT.replace(/(\w+)\W(\w+)\W(\w+)/, "^\\s*($1)\\W*($2)?\\W*($3)?([0-9]*).*")
    .replace(/MM|DD/g, "\\d{2}")
    .replace(/YYYY/g, "\\d{4}")
);
const replace = "$1/$2/$3$4".replace(/\//g, FORMAT.match(/\W/));
const formatValue = value => {
  return value
    .replace(/(^|\W)(?=\d\W)/g, "$10") // padding
    .replace(match, replace) // fields
    .replace(/(\W)+/g, "$1"); // remove repeats
};
const toTime = dt => (dt instanceof Date ? dt.getTime() : 0);

export default class DateInput extends React.Component {
  static propTypes = {
    onValueChange: PropTypes.func,
    value: PropTypes.instanceOf(Date),
    label: PropTypes.string
  };
  onChange = evt => {
    const value = formatValue(evt.target.value);
    this.setState({ value });
    if (value.length == FORMAT.length) {
      const dt = m(value, FORMAT);
      if (dt.isValid()) {
        const { onValueChange = noop } = this.props;
        onValueChange(dt.toDate());
      }
    }
  };
  constructor(props) {
    super(props);
    this.state = { uid: randomId("input-input-date"), value: null };
  }
  componentDidUpdate(nextProps) {
    const { value: nextValue } = nextProps;
    const { value: currentValue } = this.props;
    if (toTime(nextValue) != toTime(currentValue)) {
      this.setState({ value: null });
    }
  }
  render() {
    const { value, label = "", onValueChange, ...restProps } = this.props;
    const { uid } = this.state;
    const finalValue =
      this.state.value == null
        ? value ? m(value).format(FORMAT) : ""
        : this.state.value;
    return (
      <div {...restProps}>
        <label htmlFor={uid} className="text-secondary small">
          {label}
        </label>
        <input
          type="text"
          className="form-control"
          id={uid}
          placeholder={FORMAT}
          value={finalValue}
          onChange={this.onChange}
        />
      </div>
    );
  }
}
