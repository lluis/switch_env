function replaceHost(currentUrl, newHost) {
  const newURL = new URL(newHost);
  currentUrl.host = newURL.host;
  currentUrl.protocol = newURL.protocol;
  currentUrl.port = newURL.port;
  return currentUrl.href;
}

function handleClick(e, environments, currentUrl) {
  if (e.target.id === 'configuration') {
    browser.runtime.openOptionsPage();
    return;
  }
  if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
    // Ignore when click is not on a button within <div id="popup-content">.
    return;
  }

  const targetHosts = Array.isArray(environments[e.target.textContent])
    ? environments[e.target.textContent]
    : [environments[e.target.textContent]];

  if (!targetHosts.includes(currentUrl.origin)) {
    if (e.button === 0) {
      browser.tabs.update(null, { url: replaceHost(currentUrl, targetHosts[0]) });
    } else if (e.button === 1) {
      browser.tabs.create({ url: replaceHost(currentUrl, targetHosts[0]) });
    }
  }
  window.close();
}

function listenForClicks(environments, currentUrl) {
  document.addEventListener("click", (e) => {
    handleClick(e, environments, currentUrl);
  });
  document.addEventListener("auxclick", (e) => {
    handleClick(e, environments, currentUrl);
  });
}

function onError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  const errors = document.querySelector("#error-details");
  if (typeof error === 'string') {
    errors.appendChild(document.createTextNode(error));
  } else {
    errors.appendChild(error);
  }
}

function setOptions(environments, currentUrl) {
  document.querySelector("#popup-content").classList.remove("hidden");
  document.querySelector("#error-content").classList.add("hidden");
  const popup = document.querySelector('#popup-content');
  Object.keys(environments).forEach((env) => {
    const targetHosts = Array.isArray(environments[env])
      ? environments[env]
      : [environments[env]];
    const button = document.createElement('button');
    if (targetHosts.includes(currentUrl.origin)) {
      button.classList.add("active");
    }
    button.appendChild(document.createTextNode(env));
    popup.appendChild(button);
  });
}

function urlIsFromEnvironments(environments, currentUrl) {
  return Object.values(environments).flat().some((url) => {
    if (url.endsWith('/')) {
      return currentUrl.origin === url.slice(0, -1);
    } else {
      return currentUrl.origin === url;
    }
  });
}

function environmentsForCurrentUrl(environments, currentUrl) {
  return environments?.find((subset) => urlIsFromEnvironments(subset, currentUrl)) || {};
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

  if (allEnvironments === null) {
    onError('SwitchEnv is not configured');
  } else if (urlIsFromEnvironments(environments, currentUrl)) {
    setOptions(environments, currentUrl);
  } else {
    const error = document.createElement('div');
    const p = document.createElement('p');
    p.appendChild(document.createTextNode('SwitchEnv configured for:'));
    error.appendChild(p);
    const list = document.createElement('ul');
    allEnvironments?.forEach((envs) => {
      Object.values(envs).forEach((u) => {
        const listItem = document.createElement('li');
        listItem.appendChild(document.createTextNode(u));
        list.appendChild(listItem);
      });
    });
    error.appendChild(list);
    if (currentUrl.origin !== 'null') {
      const p2 = document.createElement('p');
      p2.appendChild(document.createTextNode(`(current URL: ${currentUrl.origin})`));
      error.appendChild(p2);
    }
    onError(error);
  }
  listenForClicks(environments, currentUrl);

}, onError);
