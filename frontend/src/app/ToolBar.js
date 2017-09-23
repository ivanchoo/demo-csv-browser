import React from "react";

export default class ToolBar extends React.Component {
  render() {
    // eslint-disable-next-line
    const { className = "", style } = this.props;
    return (
      <form className={className + " row bg-light py-2"} style={style}>
        <div className="col-2 border border-top-0 border-left-0 border-bottom-0">
          <label
            htmlFor="input-select-changelog"
            className="text-secondary small"
          >
            <a href="#">Upload New</a>
          </label>
          <select className="form-control" id="input-select-changelog">
            <option>1</option>
            <option>2</option>
            <option>3</option>
          </select>
        </div>
        <div className="col-2">
          <label htmlFor="input-from" className="text-secondary small">
            From Date
          </label>
          <input
            type="text"
            className="form-control"
            id="input-from"
            placeholder="DD/MM/YYYY"
            defaultValue=""
            required
          />
        </div>
        <div className="col-2">
          <label htmlFor="input-to" className="text-secondary small">
            To Date
          </label>
          <input
            type="text"
            className="form-control"
            id="input-to"
            placeholder="DD/MM/YYYY"
            defaultValue=""
            required
          />
        </div>
        <div className="col-4">
          <label htmlFor="input-filter" className="text-secondary small">
            Filter
          </label>
          <input
            type="text"
            className="form-control"
            id="input-filter"
            placeholder="e.g. 'Product' or 'Order:2'"
            defaultValue=""
            required
          />
        </div>
        <div className="col-2 d-flex align-items-end">
          <button
            className="btn btn-primary btn-block my-2 my-sm-0"
            type="submit"
          >
            Search
          </button>
        </div>
      </form>
    );
  }
  // render() {
  //   return (
  //     <nav className="navbar fixed-top navbar-dark bg-secondary">
  //       <form className="form-inline">
  //         <select
  //           className="form-control mr-2"
  //           style={{ minWidth: 160, maxWidth: 240 }}
  //         >
  //           <option>1</option>
  //           <option>2</option>
  //           <option>3</option>
  //           <option>4</option>
  //           <option>5</option>
  //         </select>
  //         <button
  //           className="btn btn-primary my-2 my-sm-0"
  //           type="submit"
  //         >
  //           Search
  //         </button>
  //       </form>
  //     </nav>
  //   );
  // }
}
