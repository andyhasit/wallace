import {load} from '../utils'

const TestComponent = <div style:color={p.color}></div>

test('Style directive works', () => {
  const component = load(TestComponent, {color: 'red'})
  expect(component.element.style.color).toBe('red')
})
