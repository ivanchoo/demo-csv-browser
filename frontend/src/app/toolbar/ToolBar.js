import React from "react";
import ChangeLogSelect from "./ChangeLogSelect";
import DateInput from "./DateInput";
import QueryInput from "./QueryInput";
import { inject, observer } from "mobx-react";

@inject(["store"])
@observer
export default class ToolBar extends React.Component {
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
            store={store}
          />
          <DateInput className="col-2" store={store} />
          <QueryInput className="col-4" store={store} />
          {submit}
        </form>
      </div>
    );
  }
}
