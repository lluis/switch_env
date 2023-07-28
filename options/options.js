const defaultOptions = {
  'development': 'http://localhost:3001',
  'staging': 'https://staging.host.com',
  'production': 'https://production.host.com',
};

function clearErrors() {
  document.querySelector('#errors').innerHTML = '';
}

function onError(error) {
  document.querySelector('#errors').innerHTML = error;
}

function getFormEnvironments() {
  clearErrors();
  try {
    return JSON.parse(
      document.querySelector('#environments').value
    );
  } catch (e) {
    onError(e);
  }
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
  browser.storage.sync.set({
    environments: getFormEnvironments()
  });
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
