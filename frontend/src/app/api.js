import invariant from "invariant";

const endpoint = "/api";
const jsonHeaders = {
  "content-type": "application/json"
};

const jsonGET = (endpoint, params) => {
  let finalEndpoint;
  if (params) {
    finalEndpoint = `${endpoint}?${Object.keys(params)
      .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
      .join("&")}`;
  } else {
    finalEndpoint = endpoint;
  }
  return fetch(finalEndpoint, {
    method: "GET",
  }).then(response => {
    return response.json();
  });
};

export const fetchChangeLogs = () => {
  return jsonGET(`${endpoint}/changelogs`);
};

export const fetchChangeLogStats = id => {
  return jsonGET(`${endpoint}/changelog/${id}/stats`);
};

export const fetchChangeLogObjects = (id, params, page = 1, size = 20) => {
  return jsonGET(`${endpoint}/changelog/${id}/objects`, {
    ...params,
    page,
    size
  });
};

export const fetchChangeLogObjectsStats = (id, params) => {
  return jsonGET(`${endpoint}/changelog/${id}/objects/stats`, params);
};

export const uploadChangeLog = file => {
  invariant(file instanceof File, `Expects 'File' object, but got ${file}`);
  const body = new FormData();
  body.append('changelog', file);
  return fetch(`${endpoint}/changelog`, {
    method: "POST",
    body
  }).then(response => {
    return response.json();
  });
};
