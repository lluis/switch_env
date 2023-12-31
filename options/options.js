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

function clearErrors() {
  const errors = document.querySelector('#errors');
  while (errors.firstChild) {
    errors.removeChild(errors.firstChild);
  }
}

function onError(error) {
  const errors = document.querySelector('#errors');
  errors.appendChild(document.createTextNode(error));
}

function getFormEnvironments() {
  return JSON.parse(
    document.querySelector('#environments').value
  );
}

function setFormEnvironments(environments) {
  clearErrors();
  try {
    document.querySelector('#environments')
      .value = JSON.stringify(environments, null, 2);
  } catch (e) {
    onError(e);
  }
}

function saveOptions(e) {
  e.preventDefault();
  clearErrors();
  try {
    browser.storage.sync.set({
      environments: getFormEnvironments()
    });
  } catch (e) {
    onError(e);
  }
}

function restoreOptions() {
  function setCurrentChoice(result) {
    let envList = document.querySelector('#environments');
    setFormEnvironments(result.environments || defaultOptions);
  }

  let getting = browser.storage.sync.get('environments');
  getting.then(setCurrentChoice, onError);
}

function resetToDefault(e) {
  e.preventDefault();
  setFormEnvironments(defaultOptions);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
document.querySelector('#reset').addEventListener('click', resetToDefault);
