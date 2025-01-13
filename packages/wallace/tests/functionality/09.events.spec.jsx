import { testMount } from "../utils";

describe("Event directive", () => {
  test("with string value creates normal event", () => {
    const MyComponent = () => (
      <div ref:target onClick="console.debug(999)"></div>
    );
    const component = testMount(MyComponent);
    expect(component).toRender(`<div onclick="console.debug(999)"></div>`);
  });

  test("with expression value creates event", () => {
    let callBackArgs;
    function foo(value) {
      callBackArgs = Array.from(arguments);
    }
    const props = { name: "bird" };
    const MyComponent = () => <div ref:target onclick={foo(42)}></div>;
    const component = testMount(MyComponent, props);
    expect(component).toRender(`<div></div>`);

    component.ref.target.click();
    expect(callBackArgs[0]).toBe(42);
  });

  test("with callback can pass extra args", () => {
    let callBackArgs;
    function foo() {
      callBackArgs = Array.from(arguments);
    }
    const props = { name: "bird" };
    const MyComponent = ({}, _component, _element, _event) => (
      <div ref:target onclick={foo(_event, _component, _element)}></div>
    );
    const component = testMount(MyComponent, props);
    expect(component).toRender(`<div></div>`);

    component.ref.target.click();
    expect(callBackArgs[0].type).toBe("click");
    expect(callBackArgs[1]).toEqual(component);
    expect(callBackArgs[2]).toEqual(component.ref.target);
  });

  test("callback uses current props", () => {
    const setName = (el, birdName) => {
      el.textContent = birdName;
    };
    const props = { name: "bird" };
    const MyComponent = (props, _element) => (
      <div ref:target onclick={setName(_element, props.name)}></div>
    );
    const component = testMount(MyComponent, props);
    component.ref.target.click();
    expect(component.ref.target.textContent).toBe("bird");
    component.setProps({ name: "cat" });
    component.ref.target.click();
    expect(component.ref.target.textContent).toBe("cat");
  });
});
