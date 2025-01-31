import { testMount } from "../utils";
import { KeyedPool } from "wallace";

describe("Repeat with pool", () => {
  const items = [
    { text: "red", id: 1 },
    { text: "green", id: 2 },
    { text: "blue", id: 3 },
  ];

  const Todo = ({ text, id }) => <div id={id}>{text}</div>;
  const pool = new KeyedPool(Todo, (item) => item.id);
  const TodoList = (data) => (
    <div>
      <Todo.repeat props={data} pool={pool} />
    </div>
  );

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

  // KeyedPool cannot be shared. Rethink this.

  // test("reordering", () => {
  //   const component = testMount(TodoList, items);
  //   expect(component).toRender(`
  //     <div>
  //       <div id="1">red</div>
  //       <div id="2">green</div>
  //       <div id="3">blue</div>
  //     </div>
  //   `);
  //   items.reverse();
  //   component.update();
  //   expect(component).toRender(`
  //     <div>
  //       <div id="3">blue</div>
  //       <div id="2">green</div>
  //       <div id="1">red</div>
  //     </div>
  //   `);
  // });
});
