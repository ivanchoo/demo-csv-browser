import { observable, action, useStrict, computed, runInAction } from "mobx";
import {
  fetchChangeLogs,
  fetchChangeLogStats,
  fetchChangeLogObjects,
  fetchChangeLogObjectsStats
} from "./api";
import { toDate, fromDatetime } from "./utils";
import invariant from "invariant";

useStrict(true);

const PAGESIZE = 20;

export class Store {
  /**
   * @type {Array} Array of fetched ChangeLog objects
   */
  @observable changeLogs = [];

  @observable changeLogsStatus = new AsyncStatus();

  /**
   * @type {ChangeLog} `null` denotes no selection.
   */
  @observable selectedChangeLog = null;

  /**
   * @type {Boolean} Whether the log changes should be stylised.
   */
  @observable displayAsSource = false;

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
    return this.changeLogsStatus.withPromise(fetchChangeLogs()).then(resp => {
      runInAction(() => {
        this.changeLogs = resp.map(data => {
          const cl = new ChangeLog();
          cl.id = data["changelog_id"];
          cl.filename = data["filename"];
          return cl;
        });
        // TODO: remove auto select
        this.selectedChangeLog = this.changeLogs[0];
      });
      return resp;
    });
  }

  @action.bound
  wantsDisplayAsSource(displayAsSource = false) {
    this.displayAsSource = displayAsSource;
  }
}

/**
 * Encapsulates a single change log data and related actions.
 */
export class ChangeLog {
  id = null;

  filename = null;

  /**
   * Represents the stats info the current ChangeLog with the shape
   * `[{ date: Date, value: Number }]` where
   *
   * - `date`: The date of the given entry
   * - `value`: Number of logs found of the given date
   * @type {Array}
   */
  @observable stats = [];

  /**
   * Async status of `stats`
   */
  @observable asyncStatus = new AsyncStatus();

  /**
   * The current query parameters state for the UI. Note this is not
   * representative of the `objects` query. See `queried`.
   * @type {Query}
   */
  @observable query = new Query();

  /**
   * Represents the stats info of the current `objects` with the shape
   * `[{ target: String, value: Number }]` where `target` is the `object_type`,
   * e.g. 'Product' or 'Order'
   * @type {Array}
   */
  @observable objectTypeStats = null;

  /**
   * Represents the stats info of the current `objects` with the shape
   * `[{ target: String, value: Number }]` where `target` is
   * `object_type:object_id`, e.g. 'Product:1' or 'Order:2'
   * @type {Array}
   */
  @observable objectStats = null;

  /**
   * @type {Number} Total number of `objects`.
   */
  @observable objectStatsTotal = 0;

  /**
   * Async status for `objectTypeStats` and `objectStats`.
   * @type {AsyncStatus}
   */
  @observable objectStatsAsyncStatus = new AsyncStatus();

  /**
   * The query parameters used to fetch `objects`.
   * @type {Query}
   */
  @observable queried = null;

  /**
   * @type {Number} Total number of pages in `objects`
   */
  @observable pages = 0;

  /**
   * @type {Number} Current page number of `currentResults`
   */
  @observable currentPage = 0;

  /**
   * @type {AsyncStatus} Async status for `objects`
   */
  @observable objectsAsyncStatus = new AsyncStatus();

  /**
   * An array of `object` results of the given `currentPage`.
   * @type {Array}
   */
  @computed
  get currentObjects() {
    if (!this.pages || !this.currentPage) {
      return null;
    }
    const objects = this._objects[this.currentPage];
    return !!objects ? objects : null;
  }

  @computed
  get isQueryDirty() {
    if (this.queried && this.query) {
      return !this.queried.equals(this.query);
    } else {
      return this.queried != this.query;
    }
  }

  _objects = {};

  /**
   * Action call to fetch the stats info for the current ChangeLog.
   *
   * Stats info consist of the entire time range of the ChangeLog, and is
   * not influenced by the `query` parameters.
   */
  @action.bound
  fetchStats() {
    return this.asyncStatus
      .withPromise(fetchChangeLogStats(this.id))
      .then(resp => {
        runInAction(() => {
          this.stats = resp.map(([date, value]) => ({
            date: toDate(date),
            value
          }));
          const n = this.stats.length;
          if (this.stats.length) {
            this.query.to = this.stats[0].date;
            this.query.from = this.stats[n - 1].date;
          } else {
            this.query.from = null;
            this.query.to = null;
          }
        });
        return resp;
      });
  }

  /**
   * Updates the current query associated the this ChangeLog.
   *
   * Note that this query represents the current UI state,
   * not the query used for fetching the current `objects`
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
  search(query = null) {
    const queried = query ? query.toObject() : {};
    this.objectStatsAsyncStatus.initialized = false;
    this.objectsAsyncStatus.initialized = false;
    return this.objectStatsAsyncStatus
      .withPromise(fetchChangeLogObjectsStats(this.id, queried))
      .then(resp => {
        runInAction(() => {
          this.queried = query.clone();
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
          const total = resp["total"];
          this.objectStatsTotal = total;
          this._objects = {};
          this.pages = total ? Math.ceil(total / PAGESIZE) : 0;
          this.currentPage = 0;
        });
      })
      .then(resp => {
        return this.pages > 0
          ? this.goto(1)
          : new Promise((resolve, reject) => {
              runInAction(() => {
                this.objectsAsyncStatus.done();
                resolve(resp);
              });
            });
      });
  }

  @action.bound
  goto(page = 1) {
    invariant(this.pages, "Cannot paginate, no pages detected");
    invariant(page > 0 && page <= this.pages, "`page` out of range");
    const queried = this.queried ? this.queried.toObject() : {};
    if (this._objects[page] != undefined) {
      this.currentPage = page;
      return Promise.resolve(page);
    }
    return this.objectsAsyncStatus
      .withPromise(fetchChangeLogObjects(this.id, queried, page, PAGESIZE))
      .then(resp => {
        runInAction(() => {
          this._objects[page] = resp;
          this.currentPage = page;
        });
        return page;
      });
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

  @computed
  get ready() {
    return this.initialized ? !this.progress : false;
  }

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

  /**
   * Calls `begin` and `done` via the given `promise` callbacks.
   *
   * Note that this method will `swallow` any error throw.
   * @returns {Promise}
   */
  @action.bound
  withPromise(promise) {
    this.begin();
    return promise.then(
      resp => {
        runInAction(() => {
          this.done();
        });
        return resp;
      },
      err => {
        runInAction(() => {
          this.done(err);
        });
        throw err;
      }
    );
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
      obj["from"] = fromDatetime(this.from);
    }
    if (this.from) {
      obj["to"] = fromDatetime(this.to);
    }
    if (this.target) {
      obj["target"] = this.target;
    }
    return obj;
  }

  /**
   * @param  {Query} other
   * @return {Boolean} True if the query parameters are the same
   */
  equals(other) {
    if (!other) return false;
    const a = this.toObject();
    const b = other.toObject();
    return ["from", "to", "target"].reduce(
      (same, k) => (same ? a[k] == b[k] : same),
      true
    );
  }

  clone() {
    const next = new Query();
    next.from = this.from;
    next.to = this.to;
    next.target = this.target;
    return next;
  }
}
