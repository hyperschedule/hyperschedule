export function allCourses() {
  return (
    fetch('https://hyperschedule.herokuapp.com/api/v2/all-courses')
      .then(httpStatusHelper)
      .then(response => response.json())
      .catch(error => error)
      .then(data => data)
  );
}

export function coursesSince(timestamp) {
  return (
    fetch(`https://hyperschedule.herokuapp.com/api/v2/courses-since/${timestamp}`)
      .then(response => response.json())
      .then(data => data)
  );
}

function httpStatusHelper(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
}
