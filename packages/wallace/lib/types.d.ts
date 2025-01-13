// This module lies about several definitions in order to make TypeScript work with JSX.
// Note that docstrings will appear in most IDE tooltips, but only the latest overload.

declare module "wallace" {
  interface ComponentFunction<Type> extends Function {
    (props: Type, ...rest: Array<any>): JSX.Element;
    nest?({ props, showIf }: { props?: Type; showIf?: boolean }): JSX.Element;
    repeat?({
      props,
      showIf,
    }: {
      props: Array<Type>;
      showIf?: boolean;
    }): JSX.Element;
  }

  export type Accepts<Type> = ComponentFunction<Type>;

  export interface Component {
    update(): void;
    setProps(props: any): void;
  }

  /**
   * Base class for extending components. If you jsut want a type see ComponentAny.
   */
  // export class Component<Type> {
  //   constructor({ props, repeat }: { props?: Type; repeat?: Array<Type> });
  //   update(): void;
  //   watch(value?: any, callback?: Function): void;
  //   nest?({ props, showIf }: { props?: Type; showIf?: boolean }): JSX.Element;
  //   repeat?({
  //     props,
  //     showIf,
  //   }: {
  //     props: Array<Type>;
  //     showIf?: boolean;
  //   }): JSX.Element;
  //   props: Type;
  //   ref: { [key: string]: HTMLElement | Component<any> };
  // }

  // /**
  //  * Shorthand type for Component<any>
  //  */
  // export type ComponentAny = Component<any>;

  // TODO: add more to this, maybe overload for each case.
  export function mount(
    element: string | HTMLElement,
    component: Accepts<any>,
    props?: any,
  ): Component;

  export function extendPrototype<T>(
    base: Accepts<T>,
    extras?: { [key: string]: any },
  ): Accepts<T>;
}

/**
 * These allow additional attributes, such as "ref:xyz" for
 * Function components and class components.
 *
 *   <div ref:xyz>
 */
declare namespace JSX {
  interface Element {
    // repeat?: any;
  }
  interface IntrinsicElements {
    // [elemName: string]: { props: any; repeat?: any };
  }
  interface ElementClass {
    // [elemName: string]: any;
    // repeat?: any;
  }
  interface IntrinsicAttributes {
    // props?: any;
    // [elemName: string]: any;
    // [attName: string]: any;
    // , attValue: any
    // props?: Record<string, any>;
  }
  interface ElementAttributesProperty {
    // props: {}; // Specify that `props` defines the component's properties
    // "*";
  }
}

// This is necessary for weird TypeScript reasons.
export {};
