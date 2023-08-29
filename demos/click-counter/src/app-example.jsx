import {mount} from 'wallace'


function App() {
  this.roots = {}
  this.watch = {}
  var _store = this
  this.data = new Proxy({},  {
    set: function(obj, prop, value) {
      obj[prop] = value
      _store.updateWatch(prop)
      return true
  }})
}

App.prototype = {
  register: function(name, initialValue, roots) {
    this.data[name] = initialValue
    this.watch[name] = roots
  },
  getRoots: function(name) {
    // Caters for undefined, in which case it returns all.
    var toUpdate = this.watch[name]
    return toUpdate ?
      toUpdate.map(name => this.roots[name]) :
      Object.values(this.roots)
  },
  updateWatch: function(name) {
    this.getRoots(name).forEach(component => {
      component.update()
    })
  },
  mount(nameOrEl, componentCls, data) {
    var c = mount(nameOrEl, componentCls, data)
    this.roots[nameOrEl] = c
  }
}


const app = new App()


// warning, this will update all components, but none are mounted yet.
app.register("count", 0)  

const ClickCounter =
  <div>
    <div>{p.count}</div>
    <button on:click={p.count += 1}>+</button>
  </div>


app.mount("main", ClickCounter, app.data)
