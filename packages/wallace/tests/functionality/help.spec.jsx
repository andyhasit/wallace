import { testMount } from "../utils";

test("Help system", () => {
  const MyComponent = () => <div help></div>;
  const component = testMount(MyComponent);
  expect(component).toRender(`
    <div></div>
  `);
});
