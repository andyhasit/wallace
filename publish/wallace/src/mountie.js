/**
 * Wallace's crude way of tracking mounting and unmounting.
 */

const trackedComponents = []

export default {
  track: function (component) {
    trackedComponents.push({component: component, isAttached: component.__ia()})
  },
  flush: function () {
    for (let i=0, il=trackedComponents.length; i<il; i++) {
      let trackedComponent = trackedComponents[i]
      let component = trackedComponent.component
      let attachedNow = component.__ia()
      if (attachedNow !== trackedComponent.isAttached) {
        let fn = attachedNow ? component.mount : component.unmount
        fn.apply(component)
        trackedComponent.isAttached = attachedNow
      }
    }
  }
}