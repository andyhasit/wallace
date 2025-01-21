import type {
  Expression,
  CallExpression,
  FunctionExpression,
  Identifier,
} from "@babel/types";
import {
  blockStatement,
  callExpression,
  functionExpression,
  identifier,
  returnStatement,
} from "@babel/types";
import { Component } from "../models";
import { IMPORTABLES } from "../constants";
import { ComponentWatch, NodeAddress } from "./types";
import {
  buildFindElementCall,
  buildNestedClassCall,
  removeKeys,
} from "./utils";

/**
 * An object with all the consolidated data for writing.
 */
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
