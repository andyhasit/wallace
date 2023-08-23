import {load} from '../utils'


test('Component can nest itself', () => {
  const tree = {
    name: 'gran', 
    nodes: [
      {
        name: 'mum',
        nodes: [
          {
            name: 'me',
            nodes: []
          },
        ]
      },
      {
        name: 'aunt',
        nodes: []
      }
    ]
  }
  const Node = 
    <div>
      <span>{p.name}</span>
      <div>
        <Node repeat={p.nodes}/>
      </div>
    </div>

  const div = load(Node, tree)
  expect(div).toShow(`
    <div>
      <span>gran</span>
      <div>
        <div>
          <span>mum</span>
          <div>
            <div>
              <span>me</span>
              <div></div>
            </div>
          </div>
        </div>
        <div>
          <span>aunt</span>
          <div></div>
        </div>
      </div>
    </div>
  `)
})