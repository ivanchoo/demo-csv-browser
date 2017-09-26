import React from "react";
import ChangeLogSelect from "./ChangeLogSelect";
import DateInput from "./DateInput";
import QueryInput from "./QueryInput";
import { inject, observer } from "mobx-react";

@inject(["store"])
@observer
export default class ToolBar extends React.Component {
  onFromChange = value => {
    const { selectedChangeLog } = this.props.store;
    if (!selectedChangeLog) return;
    selectedChangeLog.updateQuery({ from: value });
  };
  onToChange = value => {
    const { selectedChangeLog } = this.props.store;
    if (!selectedChangeLog) return;
    selectedChangeLog.updateQuery({ to: value });
  };
  onSearch = evt => {
    evt.preventDefault();
    const { selectedChangeLog } = this.props.store;
    if (!selectedChangeLog) return;
    selectedChangeLog.search(selectedChangeLog.query);
  };
  render() {
    const { className = "", store, ...restProps } = this.props;
    const selectedChangeLog = store.selectedChangeLog;
    const selectInput = (
      <ChangeLogSelect key="input-select" className="col-2" store={store} />
    );
    const children = [selectInput];
    if (selectedChangeLog && selectedChangeLog.asyncStatus.initialized) {
      children.push(
        <DateInput
          key="input-from"
          className="col-2 border border-top-0 border-right-0 border-bottom-0"
          label="From"
          value={selectedChangeLog ? selectedChangeLog.query.from : null}
          onValueChange={this.onFromChange}
        />
      );
      children.push(
        <DateInput
          key="input-to"
          className="col-2 border border-top-0 border-right-0 border-bottom-0"
          label="To"
          value={selectedChangeLog ? selectedChangeLog.query.to : null}
          onValueChange={this.onToChange}
        />
      );
      children.push(
        <QueryInput key="input-target" className="col-4" store={store} />
      );
      children.push(
        <div key="input-submit" className="col-2 d-flex align-items-end">
          <button
            className={`btn btn-block my-2 my-sm-0 ${selectedChangeLog.isQueryDirty
              ? "btn-primary"
              : "btn-secondary"}`}
            type="submit"
            onClick={this.onSearch}
            disabled={!selectedChangeLog.isQueryDirty}
          >
            Search
          </button>
        </div>
      );
    }
    return (
      <div {...restProps} className={`container-fluid bg-light ${className}`}>
        <form className="row py-2" onSubmit={evt => evt.preventDefault()}>
          {children}
        </form>
      </div>
    );
  }
}
