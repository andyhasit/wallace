import { testMount } from "../utils";

test("Ref on element points to element", () => {
  const A = () => (
    <div>
      <span class="danger" ref:a>
        hello
      </span>
    </div>
  );
  const component = testMount(A);
  expect(component.ref.a).toBeInstanceOf(HTMLSpanElement);
  expect(component.ref.a.className).toBe("danger");
});

test("Ref on nested component points to component", () => {
  const A = () => <span class="danger">hello</span>;
  const B = () => (
    <div>
      <A.nest ref:a />
    </div>
  );
  const component = testMount(B);
  expect(component.ref.a).not.toBeInstanceOf(HTMLSpanElement);
  expect(component.ref.a.parent).toBe(component);
  expect(component.ref.a.el.className).toBe("danger");
});

test("Multiple refs allowed", () => {
  const A = () => (
    <div>
      <span class="danger" ref:a>
        hello
      </span>
      <span class="warning" ref:b>
        hello
      </span>
    </div>
  );
  const component = testMount(A);
  expect(component.ref.a).toBeInstanceOf(HTMLSpanElement);
  expect(component.ref.b).toBeInstanceOf(HTMLSpanElement);
  expect(component.ref.a.className).toBe("danger");
  expect(component.ref.b.className).toBe("warning");
});

test("Multiple refs with same name compiles with error", () => {
  const src = `
    const A = () => (
    <div>
      <span ref:a>Otter</span>
      <span ref:a>Swan</span>
    </div>
  );
  `;
  expect(src).toCompileWithError("Refs must be unique within each component.");
});
