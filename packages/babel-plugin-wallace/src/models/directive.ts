import type { Expression } from "@babel/types";
import { TagNode } from "./node";

export interface NodeValue {
  type: "string" | "expression" | "null";
  value?: string | undefined;
  expression?: Expression | undefined;
}

export type Qualifier = string | undefined;

export class Directive {
  static attributeName: string;
  static help: string;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {}
}
