if (typeof browser == "undefined") {
  // Chrome does not support the browser namespace yet.
  globalThis.browser = chrome;
}

const defaultOptions = [
  {
    'development': 'http://localhost:3000',
    'staging': 'https://staging.host.com',
    'production': 'https://production.host.com',
  },
  {
    'development': 'http://localhost:3001',
    'staging': 'https://stag.otherhost.com',
    'production': 'https://prod.otherhost.com',
  }
];

function clearMessages() {
  const errors = document.querySelector('#messages');
  while (errors.firstChild) {
    errors.removeChild(errors.firstChild);
  }
}

function showMessage(error) {
  const errors = document.querySelector('#messages');
  errors.appendChild(document.createTextNode(error));
}

function getFormEnvironments() {
  return JSON.parse(
    document.querySelector('#environments').value
  );
}

function setFormEnvironments(environments) {
  clearMessages();
  try {
    document.querySelector('#environments')
      .value = JSON.stringify(environments, null, 2);
  } catch (e) {
    showMessage(e);
  }
}

function saveOptions(e) {
  e.preventDefault();
  clearMessages();
  try {
    browser.storage.sync.set({
      environments: getFormEnvironments()
    });
    showMessage('Saved successfully');
  } catch (e) {
    showMessage(e);
  }
}

function restoreOptions() {
  function setCurrentChoice(result) {
    let envList = document.querySelector('#environments');
    setFormEnvironments(result.environments || defaultOptions);
  }

  let getting = browser.storage.sync.get('environments');
  getting.then(setCurrentChoice, showMessage);
}

function resetToDefault(e) {
  e.preventDefault();
  setFormEnvironments(defaultOptions);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
document.querySelector('#reset').addEventListener('click', resetToDefault);
