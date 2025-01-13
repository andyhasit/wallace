import { testMount } from "../utils";

test("Component with nested elements renders correctly", () => {
  const Example = () => (
    <div>
      These are some cool <b>animals</b>:
      <div>
        <br />
        <ul>
          <li>Walrus</li>
          <li>Aardvark</li>
          <li>Capybara</li>
        </ul>
      </div>
    </div>
  );

  const component = testMount(Example);
  expect(component).toRender(`
    <div>
      These are some cool <b>animals</b>:
      <div>
        <br>
        <ul>
          <li>Walrus</li>
          <li>Aardvark</li>
          <li>Capybara</li>
        </ul>
      </div>
    </div>
  `);
});

// single attributes etc.
