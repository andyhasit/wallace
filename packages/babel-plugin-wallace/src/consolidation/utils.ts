import type { ArrayExpression, Expression, CallExpression } from "@babel/types";
import {
  arrayExpression,
  callExpression,
  identifier,
  numericLiteral,
} from "@babel/types";
import { ExtractedNode, Module } from "../models";
import { COMPONENT_BUILD_PARAMS, IMPORTABLES } from "../constants";
import { NodeAddress } from "./types";

export function getSiblings(
  node: ExtractedNode,
  allNodes: Array<ExtractedNode>,
) {
  return allNodes.filter((n) => n.parent === node.parent && n !== node);
}

export function getChildren(
  node: ExtractedNode,
  allNodes: Array<ExtractedNode>,
) {
  return allNodes.filter((n) => n.parent === node);
}

export function buildAddressArray(address: NodeAddress): ArrayExpression {
  return arrayExpression(address.map((i) => numericLiteral(i)));
}

export function buildFindElementCall(
  module: Module,
  address: NodeAddress,
): CallExpression {
  module.requireImport(IMPORTABLES.findElement);
  return callExpression(identifier(IMPORTABLES.findElement), [
    identifier(COMPONENT_BUILD_PARAMS.rootElement),
    buildAddressArray(address),
  ]);
}

export function buildNestedClassCall(
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

export function removeKeys(obj: Object, keys: Array<string>) {
  for (const prop in obj) {
    if (keys.includes(prop)) delete obj[prop];
    else if (typeof obj[prop] === "object") removeKeys(obj[prop], keys);
  }
}
