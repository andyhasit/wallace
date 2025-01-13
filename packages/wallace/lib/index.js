import { createComponent, mount } from "./utils";
import { Component } from "./component";
import { KeyedPool, SequentialPool } from "./pool";
import {
  extendComponent,
  findElement,
  getKeyedPool,
  getSequentialPool,
  onEvent,
  nestComponent,
  defineComponent,
  extendPrototype,
  saveMiscObject,
  saveRef,
} from "./initCalls";

export {
  extendComponent,
  Component,
  createComponent,
  defineComponent,
  extendPrototype,
  findElement,
  getKeyedPool,
  getSequentialPool,
  KeyedPool,
  mount,
  nestComponent,
  onEvent,
  saveMiscObject,
  saveRef,
  SequentialPool,
};
