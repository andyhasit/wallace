const noop = function () {};

/**
 * The base component.
 */
export function Component(parent) {
  this.parent = parent; // The parent component
  this.props = undefined; // The props passed to the component. May be changed.
  this.el = null; // the element - will be set during build
  this.ref = {}; // user set references to elements or components
  // Internal state objects
  this._mo = []; // store misc objects like pools.
  this.__stash = {}; // stash of refs, mostly elements, but also pools.
  this.__ov = {}; // The old values for watches to compare against
}

var proto = Component.prototype;

proto.onUpdate = noop;
proto.afterUpdate = noop;
proto.onInit = noop;
proto.afterInit = noop;

/**
 * Gets called once immediately after building.
 * TODO: do we need or even want this?
 */
proto.init = function () {
  this.onInit();
  // for (let key in this.__stash) {
  //   const e = this.__stash[key];
  //   if (e instanceof Component) {
  //     e.init();
  //   }
  // }
  this.afterInit();
};

Object.defineProperty(proto, "hidden", {
  set: function (value) {
    this.el.hidden = value;
  },
});

/**
 * Sets the props and updates the component.
 */
proto.setProps = function (props) {
  this.props = props;
  this.update();
};

/**
 * Updates the component.
 */
proto.update = function () {
  this.onUpdate();
  this.updateSelf();
  this.afterUpdate();
};

/**
 * Loops over watches, skipping n watches if elements are hidden.
 */
proto.updateSelf = function () {
  let i = 0,
    watch,
    element,
    shieldQuery,
    shieldQueryResult,
    shouldBeVisible;

  const watches = this.__wc;
  const lookup = this.__lu;
  const props = this.props;
  lookup.reset();
  const il = watches.length;
  while (i < il) {
    watch = watches[i];
    element = this.__stash[watch.wk];
    shieldQuery = watch.sq;
    i++;
    shouldBeVisible = true;
    if (shieldQuery) {
      shieldQueryResult = !!lookup.get(this, props, shieldQuery).n;
      shouldBeVisible = watch.rv ? shieldQueryResult : !shieldQueryResult;
      element.hidden = !shouldBeVisible;
      i += shouldBeVisible ? 0 : watch.sc;
    }
    if (shouldBeVisible) {
      lookup.applyCallbacks(this, props, element, watch.cb);
    }
  }
};

/**
 * Is Attached.
 * Determines whether this component is attached to the DOM.
 */
proto.__ia = function () {
  let e = this.el;
  while (e) {
    if (e === document) {
      return true;
    }
    e = e.parentNode;
  }
  return false;
};

// const trackedComponents = [];

/**
 * The global mount tracker.
 */
// proto.__mt = mountie;

// function trackMounting(component) {
//   trackedComponents.push({
//     component: component,
//     isAttached: component.__ia(),
//   });
// }

// function flushMounting() {
//   for (let i = 0, il = trackedComponents.length; i < il; i++) {
//     let trackedComponent = trackedComponents[i];
//     let component = trackedComponent.component;
//     let attachedNow = component.__ia();
//     if (attachedNow !== trackedComponent.isAttached) {
//       let fn = attachedNow ? component.mount : component.unmount;
//       fn.apply(component);
//       trackedComponent.isAttached = attachedNow;
//     }
//   }
// }

/**
 * Call this if you want to get mount() and unmount() callbacks.
 * TODO: fix this. Do we want init or onMount?
 */
// proto.trackMounting = function () {
//   this.__mt.track(this);
// };
