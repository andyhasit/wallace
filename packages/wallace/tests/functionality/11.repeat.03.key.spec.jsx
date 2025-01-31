import { testMount } from "../utils";

// TODO: this doesn't actually test that a KeyedPool was used. How do we do that?

describe("Repeat with string key", () => {
  const TodoList = (data) => (
    <div>
      <Todo.repeat props={data} key="id" />
    </div>
  );
  const items = [
    { text: "red", id: 1 },
    { text: "green", id: 2 },
    { text: "blue", id: 3 },
  ];
  const Todo = ({ text, id }) => <div id={id}>{text}</div>;

  test("on initial testMount", () => {
    const component = testMount(TodoList, items);
    expect(component).toRender(`
      <div>
        <div id="1">red</div>
        <div id="2">green</div>
        <div id="3">blue</div>
      </div>
    `);
  });

  test("reordering", () => {
    const component = testMount(TodoList, items);
    expect(component).toRender(`
      <div>
        <div id="1">red</div>
        <div id="2">green</div>
        <div id="3">blue</div>
      </div>
    `);
    items.reverse();
    component.update();
    expect(component).toRender(`
      <div>
        <div id="3">blue</div>
        <div id="2">green</div>
        <div id="1">red</div>
      </div>
    `);
  });
});
