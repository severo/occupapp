// Current points (or agents)

// See https://championswimmer.in/vuex-module-decorators/
import { Action, Module, VuexModule } from 'vuex-module-decorators'
import uuid from 'uuid'
import { Point, XY, XYId } from '@/types'

import { compositionsStore } from '@/store/store-accessor'

export type Domain = [number, number]

function random10To90 (): number {
  return Math.random() * 80 + 10
}

// If the domain changes, don't forget to also change the value of MAX_DIGITS
const xDomain: Domain = [0, 100]
const yDomain: Domain = [0, 100]
const MAX_DIGITS = 2

function clip (z: number, domain: Domain): number {
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

function clipAndRound ({ x, y }: XY): XY {
  return {
    x: clip(restrictPrecision(+x), xDomain),
    y: clip(restrictPrecision(+y), yDomain)
  }
}

@Module({ name: 'points', namespaced: true })
export default class PointsModule extends VuexModule {
  // State - state of truth - meant to be exported as a JSON - init definitions

  // Getters - cached, not meant to be exported
  get asArray (): Point[] {
    return Object.values(compositionsStore.current.points).sort(
      (p1, p2) => p1.number - p2.number
    )
  }
  get asMap (): Map<string, Point> {
    return new Map(this.asArray.map(p => [p.id, p]))
  }
  get size (): number {
    return this.asMap.size
  }
  get nextNumber (): number {
    // TODO: improve this, because surely there will be collisions when collaborating
    // the first free integer (there might be gaps between points numbers)
    // the points are ordered by number
    const startAt = 1
    if (this.size === 0 || this.asArray[0].number > startAt) {
      return startAt
    }
    const pointBeforeGap =
      this.asArray
        .slice(0, this.size - 1)
        .find((p, i) => p.number + 1 < this.asArray[i + 1].number) ||
      this.asArray[this.size - 1]
    return pointBeforeGap.number + 1
  }

  // Actions
  // Important: actions only receive 1 argument (payload). If you want to
  // receive various arguments -> fields of an Object
  @Action
  deleteSet (ids: Set<string>) {
    compositionsStore.deletePoints(ids)
  }
  @Action
  setXY ({ id, x, y }: XYId) {
    const point = this.asMap.get(id)
    if (point === undefined) {
      throw RangeError(`There is no point id=${id} in the list`)
    } else {
      compositionsStore.movePoint({ id, ...clipAndRound({ x, y }) })
    }
  }
  @Action
  postRandom (categoryId: string) {
    const point = {
      id: uuid.v4(),
      number: this.nextNumber,
      categoryId,
      ...clipAndRound({ x: random10To90(), y: random10To90() })
    }
    compositionsStore.appendPoint(point)
  }
}
