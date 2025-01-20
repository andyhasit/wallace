import type {
  ArrayExpression,
  Expression,
  CallExpression,
  FunctionExpression,
  Identifier,
  Statement,
} from "@babel/types";
import {
  arrayExpression,
  blockStatement,
  callExpression,
  cloneNode,
  expressionStatement,
  functionExpression,
  identifier,
  isIdentifier,
  memberExpression,
  numericLiteral,
  returnStatement,
  stringLiteral,
} from "@babel/types";
import * as t from "@babel/types";
import { codeToNode } from "../utils";
import { Component, ExtractedNode, DynamicTextNode, Module } from "../models";
import { ERROR_MESSAGES, error } from "../errors";
import {
  COMPONENT_BUILD_PARAMS,
  EVENT_CALLBACK_VARIABLES,
  IMPORTABLES,
  SPECIAL_SYMBOLS,
  WATCH_CALLBACK_PARAMS,
} from "../constants";
import { ComponentWatch, NodeAddress } from "./types";

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
