// This is the code for the in-browser help system.
// The code will be run as-is in the browser so be careful with ES6.

function showHelp(topic) {
  console.log(error)
  const errorDiv = (err) => h('div').inner([
    h('h2').text(err.title),
    h('div').text(err.info)
  ])
  if (!window.wallace_errors) {
    window.wallace_errors = []
    document.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.parentNode.removeChild(el));
  }
  window.wallace_errors.push(error)
  document.body.innerHTML = ''
  const page = h('div').inner(window.wallace_errors.map(errorDiv))
  document.body.appendChild(page.e)
}

showHelp(topic)