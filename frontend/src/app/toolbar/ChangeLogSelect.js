import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { randomId } from "../utils";

@observer
export default class ChangeLogSelect extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired
  };
  onChange = evt => {
    const { store } = this.props;
    const id = Number(evt.target.value);
    let selected = null;
    if (id > 0) {
      selected = store.changeLogs.find(changeLog => changeLog.id == id) || null;
    }
    store.select(selected);
  };
  constructor(props) {
    super(props);
    this.state = { uid: randomId("input-select-changelog") };
  }
  render() {
    const { store, ...restProps } = this.props;
    const { uid } = this.state;
    const changeLogs = store.changeLogs;
    const selectedChangeLog = store.selectedChangeLog;
    const children = changeLogs
      ? changeLogs.map(changeLog => (
          <option key={changeLog.id} value={changeLog.id}>
            {changeLog.filename}
          </option>
        ))
      : null;
    return (
      <div {...restProps}>
        <label htmlFor={uid} className="text-secondary small">
          <a href="#">Upload New</a>
        </label>
        <select
          className="form-control"
          id={uid}
          value={selectedChangeLog ? selectedChangeLog.id : "0"}
          onChange={this.onChange}
        >
          {!selectedChangeLog && (
            <option disabled value="0">
              Select:
            </option>
          )}
          {children}
        </select>
      </div>
    );
  }
}
