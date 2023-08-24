import { atom } from 'jotai'
import { Transform } from '.'
import { TilesMap } from './map/type'
import { Cartesian3 } from 'cesium'
export const mapLoadedAtom = atom(false)

// export const compess

export const transformAtom = atom<Transform | null>(null)

export const tilesMapAtom = atom<TilesMap | null>(null)

export const isCalculateAtom = atom(false)
export const calculatePositionsAtom = atom<Cartesian3[]>([])
