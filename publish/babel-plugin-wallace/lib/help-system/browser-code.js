// This is the code for the in-browser help system.
// The code will be run as-is in the browser so be careful with ES6.


// Let's at least use some of Wallace's tools!
var _wallace = require("wallace")
var h = _wallace.h
var div = function(css) {
  return h('div').css(css)
}

// Will be called in code generated in entry.js
// Builds and loads the help page, replacing any existing content

function loadHelpPage(topic) {
  // Remove styles...
  document.querySelectorAll('style').forEach(el => el.parentNode.removeChild(el));
  document.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.parentNode.removeChild(el));

  // Add new styles from helpPageCss variable...
  var style = document.createElement('style');
  style.appendChild(document.createTextNode(helpPageCss));
  var head = document.head || document.getElementsByTagName('head')[0];
  head.appendChild(style);

  // Build directives div from directives variable
  var directivesDiv = div('directives-list');
  directivesDiv.inner(directives.map(createDirectiveDiv))

  // Build overall page
  var page = div('help-page').inner([
    h('h1').text('Wallace Help'),
    directivesDiv
  ]);

  // Replace body content...
  document.body.innerHTML = '';
  document.body.appendChild(page.e);

  // Tell user to ignore warnings
  console.log('You can ignore the error messages')
}

function createDirectiveDiv(directive) {
  return div('directive').inner([
    h('h3').text(directive.name),
    div('').text(directive.params),
    h('hr')
  ])
}