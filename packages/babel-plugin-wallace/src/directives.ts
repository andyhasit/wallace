import { Directive, TagNode, NodeValue, Qualifier } from "./models";

class BaseDirective extends Directive {
  static attributeName = "base";
  static help = `
    Causes this componento to extend (inherit from) a base component:

    /h <div base={OtherComponent}></div>
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    node.setBaseComponent(value.expression);
  }
}

class BindDirective extends Directive {
  static attributeName = "bind";
  static help = `
    Create a two-way binding between and input element's "value" property and the
    expression, which must be assignable. 
    If the input is of type "checkbox", it uses the "checked" property instead.
    
    /h <div bind={p.count}></div>

    By defaults it listens to "change" event, but you can specify a different one:

    /h <div bind:keyup={p.count}></div>
  `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    const eventName = qualifier || "change";
    node.addBindInstruction(eventName, value.expression);
  }
}

class HelpDirective extends Directive {
  static attributeName = "help";
  static help = `
    Displays the help system:

    /h <div help></div>
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    console.log(`Help launched`);
  }
}

class HideDirective extends Directive {
  static attributeName = "hide";
  static help = `
    Conditionally hides an element and all nested elements.

    /h <div hide={}></div>
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    // this.ensureValueType();
    node.setConditionalDisplay(value.expression, false);
  }
}

class OnEventDirective extends Directive {
  static attributeName = "on*";
  static help = `
    Creates an event handler:

    /h <div onclick={alert('hello')}></div>
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    // TODO: change behaviour if value vs expression
    if (value.type === "string") {
      node.addFixedAttribute(base, value.value);
    } else {
      node.addEventListener(base.substring(2).toLowerCase(), value.expression);
    }
  }
}

class PropsDirective extends Directive {
  static attributeName = "props";
  static help: `
  Specify props for a nested or repeated component:
  
  /h <NestedComponent.nest props={{foo: 'bar'}} />
  /h <NestedComponent.repeat props={{foo: 'bar'}} />
  
  If it is a repeated component, then props should be an array of props.
  `;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.render(value.expression);
  }
}

class RefDirective extends Directive {
  static attributeName = "ref";
  static help = `
    Saves a reference to an element:

    /h <div ref:title></div>
    `;
  apply(node: TagNode, _value: NodeValue, qualifier: Qualifier, _base: string) {
    node.setRef(qualifier);
  }
}

class ShowDirective extends Directive {
  static attributeName = "show";
  static help = `
    Conditionally shows an element and all nested elements.

    /h <div show={}></div>
    `;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    // this.ensureValueType();
    node.setConditionalDisplay(value.expression, true);
  }
}

export const builtinDirectives = [
  BaseDirective,
  BindDirective,
  HelpDirective,
  HideDirective,
  OnEventDirective,
  PropsDirective,
  RefDirective,
  ShowDirective,
];
