const endpoint = "/api";
const jsonHeaders = {
  "content-type": "application/json"
};

const jsonGET = (endpoint, body) => {
  return fetch(endpoint, {
    method: "GET",
    headers: jsonHeaders,
    body
  }).then(response => {
    return response.json();
  });
}

export const fetchChangeLogs = () => {
  return jsonGET(`${endpoint}/changelogs`);
};


export const fetchChangeLogStats = id => {
  return jsonGET(`${endpoint}/changelog/${id}/stats`);
};

export const fetchChangeLogResultsStats = (id, query) => {
  return jsonGET(`${endpoint}/changelog/${id}/results/stats`, query);
};
