import {c, load, Component, Wrapper} from '../utils'
import {KeyedPool, SequentialPool} from '../../src/index'

class Container extends Component {
  __html__ = '<div :use="Child" :items="*|.props"></div>'
}

class Child extends Component {
  __html__ = '<div>{.props}</div>'
}

test('Initial load works', () => {
  const div = load(Container, [1, 5, 2, 6])
  expect(div).toShow(`
    <div>
      <div>1</div>
      <div>5</div>
      <div>2</div>
      <div>6</div>
    </div>
  `)
})

test('Adding items works', () => {
  const div = load(Container, [5, 2])
  expect(div).toShow(`
    <div>
      <div>5</div>
      <div>2</div>
    </div>
  `)
  div.setProps([5, 2, 6])
  expect(div).toShow(`
    <div>
      <div>5</div>
      <div>2</div>
      <div>6</div>
    </div>
  `)
})

test('Removing items works', () => {
  const div = load(Container, [5, 2, 3, 8])
  div.setProps([2, 8])
  expect(div).toShow(`
    <div>
      <div>2</div>
      <div>8</div>
    </div>
  `)
})

test('Complete replacement', () => {
  const div = load(Container, [5, 2, 3, 8])
  div.setProps([22, 18])
  expect(div).toShow(`
    <div>
      <div>22</div>
      <div>18</div>
    </div>
  `)
})

test('Reshuffle', () => {
  const div = load(Container, [7, 5, 6, 2])
  div.setProps([5, 2, 6, 7])
  expect(div).toShow(`
    <div>
      <div>5</div>
      <div>2</div>
      <div>6</div>
      <div>7</div>
    </div>
  `)
})

test('Multiple add and remove shorter', () => {
  const div = load(Container, [7, 5, 44, 6, 2, 8, 5, 6])
  div.setProps([2, 7, 11, 8, 23,])
  expect(div).toShow(`
    <div>
      <div>2</div>
      <div>7</div>
      <div>11</div>
      <div>8</div>
      <div>23</div>
    </div>
  `)
})

test('Multiple add and remove longer', () => {
  const div = load(Container, [7, 5, 8])
  div.setProps([2, 7, 11, 8, 5, 23,])
  expect(div).toShow(`
    <div>
      <div>2</div>
      <div>7</div>
      <div>11</div>
      <div>8</div>
      <div>5</div>
      <div>23</div>
    </div>
  `)
})

test('Clear', () => {
  const div = load(Container, [5, 2, 3, 8])
  div.setProps([])
  expect(div).toShow(`
    <div>
    </div>
  `)
})
