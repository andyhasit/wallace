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
import { processShields } from "./visibility";

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

/**
 * No user code gets copied into the watch callback functions, so we can hardcode params
 * as they won't clash with anything.
 */
function buildWatchCallbackParams() {
  return [
    WATCH_CALLBACK_PARAMS.newValue,
    WATCH_CALLBACK_PARAMS.oldValue,
    WATCH_CALLBACK_PARAMS.element,
    WATCH_CALLBACK_PARAMS.props,
    WATCH_CALLBACK_PARAMS.component,
  ].map((letter) => identifier(letter));
}

/**
 * Use this to rename variables when there is no scope.
 * It came from chatGTP.
 */
function renameVariablesInExpression(
  originalExpression: Expression,
  variableMapping: { [key: string]: string },
): Expression {
  // Clone the original expression to avoid modifying it
  const clonedExpression = cloneNode(originalExpression);

  // Function to replace identifiers based on the mapping
  function replaceIdentifiers(node) {
    if (isIdentifier(node) && variableMapping[node.name]) {
      return identifier(variableMapping[node.name]);
    }
    return node;
  }

  // Recursive function to traverse and update the AST
  function traverseAndReplace(node) {
    // If the node is an array (e.g., arguments), handle each element
    if (Array.isArray(node)) {
      return node.map(traverseAndReplace);
    }

    // Replace identifiers if applicable
    const newNode = replaceIdentifiers(node);

    // Recursively handle child nodes
    for (const key of Object.keys(newNode)) {
      if (newNode[key] && typeof newNode[key] === "object") {
        newNode[key] = traverseAndReplace(newNode[key]);
      }
    }
    return newNode;
  }

  return traverseAndReplace(clonedExpression);
}

function getSiblings(node: ExtractedNode, allNodes: Array<ExtractedNode>) {
  return allNodes.filter((n) => n.parent === node.parent && n !== node);
}

function getChildren(node: ExtractedNode, allNodes: Array<ExtractedNode>) {
  return allNodes.filter((n) => n.parent === node);
}

function processNodes(
  component: Component,
  componentDefinition: ComponentDefinitionData,
) {
  component.extractedNodes.forEach((node) => {
    if (node.isRepeatedNode) {
      // The watch should already have been added to the parent node, which is already
      // processed. All we do here is run some extra checks.
      const siblings = getSiblings(node, component.extractedNodes);
      if (siblings.length > 0) {
        error(node.path, ERROR_MESSAGES.REPEAT_DIRECTIVE_WITH_SIBLINGS);
      }
      const children = getChildren(node, component.extractedNodes);
      if (children.length > 0) {
        error(node.path, ERROR_MESSAGES.REPEAT_DIRECTIVE_WITH_CHILDREN);
      }
      return;
    }

    const stubName = node.getStub();
    const stubComponentName = stubName
      ? t.memberExpression(
          t.identifier(COMPONENT_BUILD_PARAMS.component),
          t.identifier(stubName),
        )
      : undefined;
    const shieldInfo = node.getShieldInfo();
    const ref = node.getRef();
    const repeatInstruction = node.getRepeatInstruction();
    const createWatch =
      node.watches.length > 0 ||
      node.bindInstructions.length > 0 ||
      shieldInfo ||
      node.isNestedClass ||
      stubName ||
      repeatInstruction;
    const shouldStash = createWatch || ref || node.eventListeners.length > 0;

    if (shouldStash) {
      const nestedComponentCls = node.isNestedClass
        ? t.identifier(node.tagName)
        : stubComponentName;
      const stashRef = nestedComponentCls
        ? componentDefinition.saveNestedClassToStash(
            node.address,
            nestedComponentCls,
          )
        : componentDefinition.saveElementToStash(node.address);

      // TODO: change this to work during consolidation as we need to read the type
      // of input (checkbox use checked, not value)
      // node.watchAttribute("value", value.expression);
      // `${watch} = ${transform}`);

      //   let [watch, transform] = attInfo.args;
      //   nodeData.addWatch(watch, undefined, "value");
      //   transform = transform ? transform : "w.getValue()";
      //   nodeData.addEventListener(event, `${watch} = ${transform}`);

      if (node.bindInstructions.length) {
        if (node.tagName.toLowerCase() == "input") {
          // @ts-ignore
          const inputType = node.element.type.toLowerCase();
          const attribute = inputType === "checkbox" ? "checked" : "value";
          node.bindInstructions.forEach(({ eventName, expression }) => {
            node.watchAttribute(attribute, expression);
            const callback = t.assignmentExpression(
              "=",
              expression as Identifier,
              t.memberExpression(
                t.identifier(EVENT_CALLBACK_VARIABLES.element),
                t.identifier(attribute),
              ),
            );
            node.addEventListener(eventName, callback);
          });
        } else {
          error(node.path, ERROR_MESSAGES.BIND_ONLY_ALLOWED_ON_INPUT);
        }
      }

      if (createWatch) {
        const _callbacks: { [key: string]: Array<Statement> } = {};
        const addCallbackStatement = (key: string, statements: Statement[]) => {
          if (!_callbacks.hasOwnProperty(key)) {
            _callbacks[key] = [];
          }
          _callbacks[key].push(...statements);
        };

        const componentWatch: ComponentWatch = {
          stashRef,
          callbacks: {},
          address: node.address,
        };
        componentDefinition.watches.push(componentWatch);

        node.watches.forEach((watch) => {
          const lookupKey = componentDefinition.addLookup(watch.expression);
          addCallbackStatement(lookupKey, codeToNode(watch.callback));
        });

        if (node.isNestedClass) {
          const props = node.getProps();
          const method = props ? "setProps" : "update";
          const args = props ? [props] : [];
          addCallbackStatement(SPECIAL_SYMBOLS.alwaysUpdate, [
            expressionStatement(
              callExpression(
                memberExpression(
                  identifier(WATCH_CALLBACK_PARAMS.element),
                  identifier(method),
                ),
                args,
              ),
            ),
          ]);
        }

        // Need to be careful with WATCH_CALLBACK_PARAMS because
        if (stubName) {
          addCallbackStatement(SPECIAL_SYMBOLS.alwaysUpdate, [
            expressionStatement(
              callExpression(
                memberExpression(
                  identifier(WATCH_CALLBACK_PARAMS.element),
                  identifier("setProps"),
                ),
                [component.propsIdentifier],
              ),
            ),
          ]);
        }

        if (shieldInfo) {
          const shieldLookupKey = componentDefinition.addLookup(
            shieldInfo.expression,
          );
          componentWatch.shieldInfo = {
            count: 0,
            key: shieldLookupKey,
            reverse: shieldInfo.reverse,
          };
        }

        if (repeatInstruction) {
          const miscObjectKey = componentDefinition.getNextMiscObjectKey();
          componentDefinition.component.module.requireImport(
            IMPORTABLES.getSequentialPool,
          );
          const poolInstance =
            repeatInstruction.poolExpression ||
            callExpression(identifier(IMPORTABLES.getSequentialPool), [
              identifier(repeatInstruction.componentCls),
            ]);
          componentDefinition.wrapStashCall(
            stashRef,
            IMPORTABLES.saveMiscObject,
            [identifier(COMPONENT_BUILD_PARAMS.component), poolInstance],
          );
          addCallbackStatement(SPECIAL_SYMBOLS.alwaysUpdate, [
            expressionStatement(
              callExpression(
                memberExpression(
                  memberExpression(
                    memberExpression(
                      component.componentIdentifier,
                      identifier(SPECIAL_SYMBOLS.objectStash),
                    ),
                    numericLiteral(miscObjectKey),
                    true,
                  ),
                  identifier(SPECIAL_SYMBOLS.patch),
                ),
                [
                  identifier(WATCH_CALLBACK_PARAMS.element),
                  repeatInstruction.expression,
                  component.componentIdentifier,
                ],
              ),
            ),
          ]);
        }

        for (const key in _callbacks) {
          const args =
            key === SPECIAL_SYMBOLS.alwaysUpdate
              ? [
                  identifier(WATCH_CALLBACK_PARAMS.element),
                  component.propsIdentifier,
                  component.componentIdentifier,
                ]
              : buildWatchCallbackParams();
          componentWatch.callbacks[key] = functionExpression(
            null,
            args,
            blockStatement(_callbacks[key]),
          );
        }
      }

      if (ref) {
        if (componentDefinition.collectedRefs.includes(ref)) {
          error(
            node.path,
            ERROR_MESSAGES.REFS_MUST_BE_UNIQUE_WITHIN_EACH_COMPONENT,
          );
        }
        componentDefinition.collectedRefs.push(ref);
        componentDefinition.wrapStashCall(stashRef, IMPORTABLES.saveRef, [
          identifier(COMPONENT_BUILD_PARAMS.component),
          stringLiteral(ref),
        ]);
      }

      // Note that some things will already have been renamed, but here we are renaming
      // specifically inside the buildComponent scope.
      const eventVariableMapping: { [key: string]: string } = {
        [component.componentIdentifier.name]: COMPONENT_BUILD_PARAMS.component,
        [component.propsIdentifier.name]:
          `${COMPONENT_BUILD_PARAMS.component}.props`,
        [EVENT_CALLBACK_VARIABLES.element]: `${EVENT_CALLBACK_VARIABLES.event}.target`,
      };
      node.eventListeners.forEach((listener) => {
        const updatedExpression = renameVariablesInExpression(
          listener.callback,
          eventVariableMapping,
        );

        componentDefinition.wrapStashCall(stashRef, IMPORTABLES.onEvent, [
          stringLiteral(listener.eventName),
          functionExpression(
            null,
            [identifier(EVENT_CALLBACK_VARIABLES.event)],
            blockStatement([expressionStatement(updatedExpression)]),
          ),
        ]);
      });
    }
  });
}

function hoistTextNodes(component: Component) {
  const nodesToDelete = [];
  component.extractedNodes.forEach((node) => {
    if (node instanceof DynamicTextNode) {
      if (getSiblings(node, component.extractedNodes).length === 0) {
        const parent = node.parent;
        parent.watches.push(...node.watches);
        nodesToDelete.push(node);
        node.element.remove();
      }
    }
  });
  nodesToDelete.forEach((node) => {
    component.extractedNodes.splice(component.extractedNodes.indexOf(node), 1);
  });
}

/**
 * Deals with shielding, setting ref keys and such.
 */
export function consolidateComponent(
  component: Component,
): ComponentDefinitionData {
  const componentDefinition = new ComponentDefinitionData(component);
  hoistTextNodes(component);
  processNodes(component, componentDefinition);
  processShields(componentDefinition.watches);
  // This must be done after all the processing, as DOM may have changed.
  componentDefinition.html = component.rootElement.outerHTML;
  return componentDefinition;
}
