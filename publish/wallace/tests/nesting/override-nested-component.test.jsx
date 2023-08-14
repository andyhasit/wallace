import {load, Component} from '../utils'


const Footer1 = <footer>Footer 1 - {p}</footer>
const Footer2 = <footer>Footer 2 - {p}</footer>

const Page =
  <div>
    <h1>Hello</h1>
    <this.footer _props={p.title}/>
  </div>

Page.prototype.footer = Footer1


const PageSubclass = Component.define({
  _base: Page
})
PageSubclass.prototype.footer = Footer2


test('Page uses Footer1', () => {
  const div = load(Page, {title: 'News'})
  expect(div).toShow(`
    <div>
      <h1>Hello</h1>
      <footer>Footer 1 - 
        <text>News</text>
      </footer>
    </div>
  `)
})


test('PageSubclass uses Footer2', () => {
  const div = load(PageSubclass, {title: 'Drama'})
  expect(div).toShow(`
    <div>
      <h1>Hello</h1>
      <footer>Footer 2 - 
        <text>Drama</text>
      </footer>
    </div>
  `)
})