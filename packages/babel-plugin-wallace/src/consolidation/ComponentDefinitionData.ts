import type {
  ArrayExpression,
  Expression,
  CallExpression,
  FunctionExpression,
  Identifier,
} from "@babel/types";
import {
  arrayExpression,
  blockStatement,
  callExpression,
  functionExpression,
  identifier,
  numericLiteral,
  returnStatement,
} from "@babel/types";
import { Component, Module } from "../models";
import { COMPONENT_BUILD_PARAMS, IMPORTABLES } from "../constants";
import { ComponentWatch, NodeAddress } from "./types";

function buildAddressArray(address: NodeAddress): ArrayExpression {
  return arrayExpression(address.map((i) => numericLiteral(i)));
}

function buildFindElementCall(
  module: Module,
  address: NodeAddress,
): CallExpression {
  module.requireImport(IMPORTABLES.findElement);
  return callExpression(identifier(IMPORTABLES.findElement), [
    identifier(COMPONENT_BUILD_PARAMS.rootElement),
    buildAddressArray(address),
  ]);
}

function buildNestedClassCall(
  module: Module,
  address: NodeAddress,
  componentCls: Expression,
): CallExpression {
  module.requireImport(IMPORTABLES.nestComponent);
  return callExpression(identifier(IMPORTABLES.nestComponent), [
    identifier(COMPONENT_BUILD_PARAMS.rootElement),
    buildAddressArray(address),
    componentCls,
    identifier(COMPONENT_BUILD_PARAMS.component),
  ]);
}

function removeKeys(obj: Object, keys: Array<string>) {
  for (const prop in obj) {
    if (keys.includes(prop)) delete obj[prop];
    else if (typeof obj[prop] === "object") removeKeys(obj[prop], keys);
  }
}

export class ComponentDefinitionData {
  component: Component;
  html: string;
  watches: Array<ComponentWatch> = [];
  stash: { [key: string]: CallExpression } = {};
  baseComponent: Expression | undefined;
  lookups: { [key: string]: FunctionExpression } = {};
  collectedRefs: Array<string> = [];
  #stashKey: number = 0;
  #miscObjectKey: number = 0;
  #lookupKeys: Array<String> = [];
  constructor(component: Component) {
    this.component = component;
    this.baseComponent = component.baseComponent;
  }
  saveElementToStash(address: NodeAddress) {
    this.#stashKey++;
    const key = String(this.#stashKey);
    this.stash[key] = buildFindElementCall(this.component.module, address);
    return key;
  }
  saveNestedClassToStash(address: NodeAddress, componentCls: Expression) {
    this.#stashKey++;
    const key = String(this.#stashKey);
    this.stash[key] = buildNestedClassCall(
      this.component.module,
      address,
      componentCls,
    );
    return key;
  }
  addLookup(expression: Expression) {
    const hashExpression = (expr) => {
      const copy = JSON.parse(JSON.stringify(expr));
      removeKeys(copy, ["start", "end", "loc"]);
      return JSON.stringify(copy);
    };
    const hash = hashExpression(expression);
    if (this.#lookupKeys.indexOf(hash) === -1) {
      this.#lookupKeys.push(hash);
    }
    const key = String(this.#lookupKeys.indexOf(hash));
    this.lookups[key] = functionExpression(
      null,
      this.getLookupCallBackParams(),
      blockStatement([returnStatement(expression)]),
    );
    return key;
  }
  getFunctionIdentifier(name: IMPORTABLES) {
    this.component.module.requireImport(name);
    return identifier(name);
  }
  getLookupCallBackParams(): Array<Identifier> {
    return [this.component.propsIdentifier, this.component.componentIdentifier];
  }
  wrapStashCall(
    key: string,
    functionName: IMPORTABLES,
    remainingArgs: Expression[],
  ) {
    this.stash[key] = callExpression(this.getFunctionIdentifier(functionName), [
      this.stash[key],
      ...remainingArgs,
    ]);
  }
  getNextMiscObjectKey() {
    this.#miscObjectKey++;
    return this.#miscObjectKey - 1;
  }
}
