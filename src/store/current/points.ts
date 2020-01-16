// Current points (or agents)

// See https://championswimmer.in/vuex-module-decorators/
import { Action, Module, VuexModule, getModule } from 'vuex-module-decorators'
import store from '@/store'
import uuid from 'uuid'
import { Point, XYCategory, XYId } from '@/types'

import Compositions from '@/store/compositions.ts'
const compositions = getModule(Compositions)

export type Domain = [number, number]

function random10To90 (): number {
  return Math.random() * 80 + 10
}

// If the domain changes, don't forget to also change the value of MAX_DIGITS
const xDomain: Domain = [0, 100]
const yDomain: Domain = [0, 100]
const MAX_DIGITS = 2

function clampToDomain (z: number, domain: Domain): number {
  if (z < domain[0]) {
    return domain[0]
  }
  if (z > domain[1]) {
    return domain[1]
  }
  return z
}

const MULTIPLIER = Math.pow(10, MAX_DIGITS)
function restrictPrecision (x: number): number {
  return Math.round(x * MULTIPLIER) / MULTIPLIER
}

function clampAndRestrictPrecision (point: Point): Point {
  point.x = clampToDomain(restrictPrecision(+point.x), xDomain)
  point.y = clampToDomain(restrictPrecision(+point.y), yDomain)
  return point
}

@Module({ dynamic: true, store, name: 'points', namespaced: true })
export default class Points extends VuexModule {
  // State - state of truth - meant to be exported as a JSON - init definitions

  // Getters - cached, not meant to be exported
  get asArray (): Point[] {
    return [...compositions.current.points].sort(
      (p1, p2) => p1.number - p2.number
    )
  }
  get asMap (): Map<string, Point> {
    return new Map(this.asArray.map(p => [p.id, p]))
  }
  get size (): number {
    return this.asMap.size
  }
  get get (): (id: string) => Point | undefined {
    return (id: string): Point | undefined => this.asMap.get(id)
  }
  get nextNumber (): number {
    // the first free integer (there might be gaps between points numbers)
    // the points are ordered by number
    const startAt = 1
    if (this.size === 0 || this.asArray[0].number > startAt) {
      return startAt
    }
    const pointBeforeGap = this.asArray.slice(0, this.size - 1).find(
      (p, i) => p.number + 1 < this.asArray[i + 1].number
    ) || this.asArray[this.size - 1]
    return pointBeforeGap.number + 1
  }

  // Actions
  // Important: actions only receive 1 argument (payload). If you want to
  // receive various arguments -> fields of an Object
  @Action
  setPoints (points: Point[]) {
    compositions.setCurrentPoints(points)
  }
  @Action
  setPoint (point: Point) {
    // Don't allow positions outside of [0, 100] + reduce precision
    this.setPoints([
      ...this.asMap.set(point.id, clampAndRestrictPrecision(point)).values()
    ])
  }
  @Action
  clear () {
    this.setPoints([])
  }
  @Action
  post (p: XYCategory) {
    this.setPoint({ id: uuid.v4(), ...p, number: this.nextNumber })
  }
  @Action
  deleteSet (ids: Set<string>) {
    this.setPoints(this.asArray.filter(p => !ids.has(p.id)))
  }
  @Action
  setXY ({ id, x, y }: XYId) {
    const point = this.asMap.get(id)
    if (point === undefined) {
      throw RangeError(`There is no point id=${id} in the list`)
    } else {
      this.setPoint({ ...point, x, y })
    }
  }
  @Action
  postCenter (categoryId: string) {
    this.post({ x: 50, y: 50, categoryId })
  }
  @Action
  postRandom (categoryId: string) {
    this.post({ x: random10To90(), y: random10To90(), categoryId })
  }
}
