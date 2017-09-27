import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { randomId } from "../utils";
import FileUploadInput from "./FileUploadInput";

@observer
export default class ChangeLogSelect extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired
  };
  onDelete = evt => {
    evt.preventDefault();
    const { store } = this.props;
    const selectedChangeLog = store.selectedChangeLog;
    if (!selectedChangeLog) return;
    const filename = selectedChangeLog.filename || "Current Change Logs";
    const message = `Do you want to delete '${filename}?

You cannot undo this action.'`;
    if (window.confirm(message)) {
      store.remove(selectedChangeLog);
    }
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
    const hasSelected = !!selectedChangeLog;
    const hasChangeLogs = changeLogs && changeLogs.length;
    const disabled = store.changeLogsAsyncStatus.progress;
    const labelChildren = [];
    if (hasChangeLogs) {
      labelChildren.push(
        <FileUploadInput key="link-upload" disabled={disabled}>
          Add <span className="d-none d-lg-inline">New</span>
        </FileUploadInput>
      );
    } else {
      labelChildren.push("Start Here");
    }

    if (hasSelected) {
      labelChildren.push(
        <span key="link-delete">
          {" "}
          or{" "}
          <a
            href="#"
            className={disabled ? "disabled" : ""}
            onClick={this.onDelete}
          >
            Delete <span className="d-none d-lg-inline">This</span>
          </a>
        </span>
      );
    }
    const input = hasChangeLogs ? (
      <select
        className="form-control"
        id={uid}
        value={selectedChangeLog ? selectedChangeLog.id : "0"}
        onChange={this.onChange}
        disabled={disabled}
      >
        <option disabled value="0">
          or Select Here
        </option>
        {changeLogs.map(changeLog => (
          <option key={changeLog.id} value={changeLog.id}>
            {changeLog.filename}
          </option>
        ))}
      </select>
    ) : (
      <FileUploadInput
        className="btn btn-primary btn-block"
        disabled={disabled}
      >
        Add <span className="d-none d-lg-inline">Log File</span>
      </FileUploadInput>
    );
    return (
      <div {...restProps}>
        <label htmlFor={uid} className="text-secondary small">
          {labelChildren}
        </label>
        {input}
      </div>
    );
  }
}
