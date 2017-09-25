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
    selectedChangeLog.updateQuery({ from: value })
  };
  onToChange = value => {
    const { selectedChangeLog } = this.props.store;
    if (!selectedChangeLog) return;
    selectedChangeLog.updateQuery({ to: value })
  };
  render() {
    const { className = "", store, ...restProps } = this.props;
    const selected = store.selectedChangeLog;
    const submit = selected ? (
      <div className="col-2 d-flex align-items-end">
        <button
          className="btn btn-primary btn-block my-2 my-sm-0"
          type="submit"
        >
          Search
        </button>
      </div>
    ) : null;
    return (
      <div {...restProps} className={`container-fluid bg-light ${className}`}>
        <form className="row py-2">
          <ChangeLogSelect className="col-2" store={store} />
          <DateInput
            className="col-2 border border-top-0 border-right-0 border-bottom-0"
            label="From"
            value={selected ? selected.query.from : null}
            onValueChange={this.onFromChange}
          />
          <DateInput
            className="col-2 border border-top-0 border-right-0 border-bottom-0"
            label="To"
            value={selected ? selected.query.to : null}
            onValueChange={this.onToChange}
          />
          <QueryInput className="col-4" store={store} />
          {submit}
        </form>
      </div>
    );
  }
}
