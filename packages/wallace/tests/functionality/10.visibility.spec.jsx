import { testMount } from "../utils";

describe("Visibility controlled by `hide` directive", () => {
  test.each([true, false])("when initalValue = %s", (initalValue) => {
    let hideTarget = initalValue;
    const MyComponent = () => (
      <ul>
        <li ref:target hide={hideTarget}>
          Hello
        </li>
        <li ref:other>Goodbye</li>
      </ul>
    );
    const component = testMount(MyComponent);
    expect(component.ref.target.hidden).toBe(initalValue);
    expect(component.ref.other.hidden).toBe(false);
    hideTarget = !hideTarget;
    component.update();
    expect(component.ref.target.hidden).toBe(!initalValue);
    expect(component.ref.other.hidden).toBe(false);
  });
});

describe("Visibility controlled by `show` directive", () => {
  test.each([true, false])("when initalValue = %s", (initalValue) => {
    let showTarget = initalValue;
    const MyComponent = () => (
      <ul>
        <li ref:target show={showTarget}>
          Hello
        </li>
        <li ref:other>Goodbye</li>
      </ul>
    );
    const component = testMount(MyComponent);
    expect(component.ref.target.hidden).toBe(!initalValue);
    expect(component.ref.other.hidden).toBe(false);
    showTarget = !showTarget;
    component.update();
    expect(component.ref.target.hidden).toBe(initalValue);
    expect(component.ref.other.hidden).toBe(false);
  });
});

describe("Nested components", () => {
  test("show and hide their root element", () => {
    let showWalrus = true;
    const walrus = { name: "Mr Walrus" };
    const fox = { name: "Ms Fox" };
    const Animal = (animal) => <div>Hello {animal.name}</div>;
    const AnimalList = () => (
      <div>
        <Animal.nest show={showWalrus} props={walrus} ref:target />
        <Animal.nest props={fox} ref:other />
      </div>
    );
    const component = testMount(AnimalList);
    expect(component.ref.target.el.hidden).toBe(false);
    expect(component.ref.other.el.hidden).toBe(false);
    showWalrus = false;
    component.update();
    expect(component.ref.target.el.hidden).toBe(true);
    expect(component.ref.other.el.hidden).toBe(false);
  });

  test("do not update when hidden", () => {
    let showTarget = true;
    const getCcount = (p) => {
      p.count += 1;
      return p.count;
    };
    const UpdateCounter = (p) => <div ref:val>{getCcount(p)}</div>;
    const c1 = { count: 0 };
    const c2 = { count: 0 };
    const Counters = () => (
      <div>
        <div show={showTarget}>
          <UpdateCounter.nest props={c1} ref:target />
        </div>
        <UpdateCounter.nest props={c2} ref:other />
      </div>
    );
    const component = testMount(Counters);
    const targetSpan = component.ref.target.ref.val;
    const otherSpan = component.ref.other.ref.val;

    expect(targetSpan.textContent).toBe("1");
    expect(otherSpan.textContent).toBe("1");

    component.update();
    expect(targetSpan.textContent).toBe("2");
    expect(otherSpan.textContent).toBe("2");

    showTarget = false;
    component.update();
    expect(targetSpan.textContent).toBe("2");
    expect(otherSpan.textContent).toBe("3");

    component.update();
    expect(targetSpan.textContent).toBe("2");
    expect(otherSpan.textContent).toBe("4");

    showTarget = true;
    component.update();
    expect(targetSpan.textContent).toBe("3");
    expect(otherSpan.textContent).toBe("5");
  });
});
