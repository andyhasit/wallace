import {createComponent, h, mount, wrap} from  './utils'
import {isStr} from  './helpers'
import {Component} from './component'
import {define} from './define'
import {KeyedPool, InstancePool, SequentialPool} from './pool'
import {Wrapper} from './wrapper'

module.exports = {
  createComponent,
  h,
  mount,
  KeyedPool,
  InstancePool,
  isStr,
  SequentialPool,
  define,
  Component,
  Wrapper,
  wrap
}