import { testMount } from "../utils";

describe("Repeat with shared pool", () => {
  const primary = [
    { text: "red", id: 1 },
    { text: "green", id: 2 },
    { text: "blue", id: 3 },
  ];
  const other = [
    { text: "purple", id: 4 },
    { text: "teal", id: 5 },
  ];

  const Color = ({ text, id }) => <li id={id}>{text}</li>;
  const pool = {};
  const ColorList = (colors) => (
    <ul>
      <Color.repeat props={colors} key={(item) => item.id} pool={pool} />
    </ul>
  );

  const Main = () => (
    <div>
      <ColorList.nest props={primary} />
      <ColorList.nest props={other} />
    </div>
  );

  test("on initial testMount", () => {
    const component = testMount(Main);

    expect(Object.keys(pool)).toEqual(["1", "2", "3", "4", "5"]);
    expect(component).toRender(`
      <div>
        <ul>
          <li id="1">red</li>
          <li id="2">green</li>
          <li id="3">blue</li>
        </ul>
        <ul>
          <li id="4">purple</li>
          <li id="5">teal</li>
        </ul>
      </div>
    `);

    expect(Object.keys(pool)).toEqual(["1", "2", "3", "4", "5"]);
    other.push(primary.pop());
    component.update();
    expect(component).toRender(`
      <div>
        <ul>
          <li id="1">red</li>
          <li id="2">green</li>
        </ul>
        <ul>
          <li id="4">purple</li>
          <li id="5">teal</li>
          <li id="3">blue</li>
        </ul>
      </div>
    `);

    expect(Object.keys(pool)).toEqual(["1", "2", "3", "4", "5"]);
  });
});
