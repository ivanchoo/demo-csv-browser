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

export class Query {
  /**
   * @type {Date}
   */
  @observable from = null;

  /**
   * @type {Date}
   */
  @observable to = null;

  /**
   * Target object to query, supports 'ObjectType' or 'ObjectType:ObjectId'.
   * Example: 'Product', 'Object:2'
   * @type {String}
   */
  @observable target: null;

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

export class Store {
  @observable changeLogs = [];

  @observable status = "init";

  @observable selectedChangeLog = null;

  @action.bound
  select(changeLog) {
    invariant(changeLog instanceof ChangeLog, "Expects ChangeLog type");
    this.selectedChangeLog = changeLog;
  }

  @action.bound
  fetch() {
    this.status = "pending";
    return fetchChangeLogs().then(
      resp => {
        runInAction(() => {
          this.changeLogs = resp.map(data => {
            const cl = new ChangeLog();
            cl.id = data["changelog_id"];
            cl.filename = data["filename"];
            return cl;
          });
          this.status = "success";
          // TODO: remove auto select
          this.selectedChangeLog = this.changeLogs[0];
        });
        return resp;
      },
      () => {
        runInAction(() => {
          this.status = "error";
        });
      }
    );
  }
}
