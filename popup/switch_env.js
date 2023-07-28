function replaceHost(currentUrl, newHost) {
  const newURL = new URL(newHost);
  currentUrl.host = newURL.host;
  currentUrl.protocol = newURL.protocol;
  currentUrl.port = newURL.port;
  return currentUrl.href;
}

function listenForClicks(environments, currentUrl) {
  document.addEventListener("click", (e) => {

    if (e.target.id === 'configuration') {
      browser.runtime.openOptionsPage();
      return;
    }
    if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
      // Ignore when click is not on a button within <div id="popup-content">.
      return;
    }
    if (currentUrl.origin != environments[e.target.textContent]) {
      browser.tabs.update(null, {
        url: replaceHost(
          currentUrl,
          environments[e.target.textContent]
        )
      });
    }
    window.close();
  });
}

function onError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  document.querySelector("#error-details")
    .innerHTML = error;
}

function setOptions(environments) {
  document.querySelector("#popup-content").classList.remove("hidden");
  document.querySelector("#error-content").classList.add("hidden");
  document.querySelector('#popup-content')
    .innerHTML = Object.keys(environments)
    .map((env) => `<button>${env}</button>`)
    .join('');
}

function urlIsFromEnvironments(environments, currentUrl) {
  return Object.values(environments).some((url) => {
    if (url.endsWith('/')) {
      return currentUrl.origin == url.slice(0, -1);
    } else {
      return currentUrl.origin == url;
    }
  });
}

function environmentsForCurrentUrl(environments, currentUrl) {
  return environments.find((subset) => urlIsFromEnvironments(subset, currentUrl)) || [];
}

Promise.all([

  // get current tab
  browser.tabs.query({currentWindow: true, active: true}),

  // get stored config
  browser.storage.sync.get('environments')

]).then(values => {

  const currentUrl = new URL(values[0][0].url);
  const allEnvironments = values[1].environments;
  const environments = environmentsForCurrentUrl(allEnvironments, currentUrl);

  if (urlIsFromEnvironments(environments, currentUrl)) {
    setOptions(environments);
  } else {
    let error = `<p>${currentUrl.origin} not configured:</p>`;
    error += '<ul>'
    allEnvironments.forEach((envs) => {
      error += Object.values(envs).map((u) => `<li>${u}</li>`).join('');
    });
    error += '</ul>'
    onError(error);
  }
  listenForClicks(environments, currentUrl);

}, onError);
