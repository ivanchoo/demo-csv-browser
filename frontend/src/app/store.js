import { observable, action, useStrict, computed, runInAction } from "mobx";
import {
  fetchChangeLogs,
  fetchChangeLogStats,
  fetchChangeLogResults,
  fetchChangeLogResultsStats
} from "./api";
import { toDate, toDatetime } from "./utils";
import invariant from "invariant";

useStrict(true);

export class Store {
  /**
   * @type {Array} Array of fetched ChangeLog objects
   */
  @observable changeLogs = [];

  @observable changeLogsStatus = null;

  /**
   * @type {ChangeLog} `null` denotes no selection.
   */
  @observable selectedChangeLog = null;

  constructor() {
    this.changeLogsStatus = new AsyncStatus();
  }

  /**
   * Sets the `selectedChangeLog` to the given `changeLog` and update bindings.
   *
   * @type {ChangeLog}
   */
  @action.bound
  select(changeLog) {
    invariant(changeLog instanceof ChangeLog, "Expects ChangeLog type");
    this.selectedChangeLog = changeLog;
  }

  /**
   * Fetches the `changeLogs` information.
   */
  @action.bound
  fetch() {
    this.changeLogsStatus.begin();
    return fetchChangeLogs().then(
      resp => {
        runInAction(() => {
          this.changeLogs = resp.map(data => {
            const cl = new ChangeLog();
            cl.id = data["changelog_id"];
            cl.filename = data["filename"];
            return cl;
          });
          this.changeLogsStatus.done();
          // TODO: remove auto select
          this.selectedChangeLog = this.changeLogs[0];
        });
        return resp;
      },
      () => {
        runInAction(err => {
          this.changeLogsStatus.done(error);
        });
      }
    );
  }
}

/**
 * Represents the async status of a given context.
 */
export class AsyncStatus {
  /**
   * Denotes if a given context has been initialized, e.g. fetched intial data.
   * @type {Boolean}
   */
  @observable initialized = false;

  @observable progress = false;

  @observable error = null;

  @observable asyncId = 0;

  @action.bound
  begin() {
    this.asyncId++;
    this.progress = true;
    this.error = null;
  }

  @action.bound
  done(error = null) {
    if (!this.initialized) {
      this.initialized = true;
    }
    this.progress = false;
    this.error = error;
  }
}

/**
 * A set of query parameters
 */
export class Query {
  /**
   * @type {Date} From date range.
   */
  @observable from = null;

  /**
   * @type {Date} To date range.
   */
  @observable to = null;

  /**
   * Target object to query, supports 'ObjectType' or 'ObjectType:ObjectId'.
   * Example: 'Product', 'Object:2'
   * @type {String}
   */
  @observable target: null;

  /**
   * @return {Object} A plain old object ready for query.
   */
  toObject() {
    const obj = {};
    if (this.from) {
      obj["from"] = toDatetime(this.from);
    }
    if (this.from) {
      obj["to"] = toDatetime(this.to);
    }
    if (this.target) {
      obj["target"] = this.target;
    }
    return obj;
  }
}

/**
 * Encapsulates a single change log data and related actions.
 * @type {[type]}
 */
export class ChangeLog {
  id = null;

  filename = null;

  @observable queried = null;

  @observable query = null;

  @observable stats = null;

  @observable results = null;

  @observable objectTypeStats = null;

  @observable objectStats = null;

  constructor() {
    this.query = new Query();
  }

  /**
   * Action call to fetch the stats info for the current ChangeLog.
   *
   * Stats info consist of the entire time range of the ChangeLog, and is
   * not influenced by the `query` parameters.
   */
  @action.bound
  fetchStats() {
    return fetchChangeLogStats(this.id).then(
      resp => {
        runInAction(() => {
          this.stats = resp.map(([date, value]) => ({
            date: toDate(date),
            value
          }));
          const n = this.stats.length;
          if (this.stats.length) {
            this.query.from = this.stats[0].date;
            this.query.to = this.stats[n - 1].date;
          } else {
            this.query.from = null;
            this.query.to = null;
          }
        });
        return resp;
      },
      () => {
        runInAction(() => {
          this.stats = [];
        });
      }
    );
  }

  /**
   * Updates the current query associated the this ChangeLog.
   *
   * Note that this query represents the current UI state,
   * not the query used for fetching the current `results`
   */
  @action.bound
  updateQuery(next) {
    Object.keys(next).forEach(key => {
      const value = next[key];
      switch (key) {
        case "from":
        case "to":
          invariant(
            value === null || value instanceof Date,
            "Expects Date or `null`"
          );
          return (this.query[key] = value);
        case "target":
          invariant(
            value === null || typeof value == "string",
            "Expects String or `null`"
          );
          return (this.query.target = !!value ? value : null);
        default:
          throw new Error(`Unsupported query ${key}`);
      }
    });
  }

  @action.bound
  fetchResults(page = 0) {
    return fetchChangeLogResults(this.id, this.query.toObject(), page).then(
      resp => {
        runInAction(() => {
          if (this.results == null) {
            this.results = [];
          }
          this.results[page] = resp;
        });
        return resp;
      },
      () => {
        runInAction(() => {
          if (this.results == null) {
            this.results = [];
          }
          this.results[page] = [];
        });
      }
    );
  }

  @action.bound
  fetchResultsStats() {
    return fetchChangeLogResultsStats(this.id, this.query.toObject()).then(
      resp => {
        runInAction(() => {
          this.objectTypeStats = resp[
            "object_types"
          ].map(([target, value]) => ({
            target,
            value
          }));
          this.objectStats = resp["objects"].map(([target, value]) => ({
            target,
            value
          }));
        });
        return resp;
      },
      () => {
        runInAction(() => {
          this.objectTypeStats = [];
          this.objectStats = [];
        });
      }
    );
  }
}
