export enum WATCH_CALLBACK_PARAMS {
  newValue = "n",
  oldValue = "o",
  element = "e",
  props = "p",
  component = "c",
}

export enum COMPONENT_BUILD_PARAMS {
  component = "component",
  rootElement = "root",
}

export enum IMPORTABLES {
  defineComponent = "defineComponent",
  extendComponent = "extendComponent",
  findElement = "findElement",
  nestComponent = "nestComponent",
  saveRef = "saveRef",
  saveMiscObject = "saveMiscObject",
  onEvent = "onEvent",
  getSequentialPool = "getSequentialPool",
}

export enum EVENT_CALLBACK_VARIABLES {
  component = "_component",
  element = "_element",
  event = "_event",
}

export enum SPECIAL_SYMBOLS {
  objectStash = "_o",
  alwaysUpdate = "__",
  patch = "patch",
}
