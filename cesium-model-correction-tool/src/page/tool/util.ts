import { Cartesian3, Color, Entity, JulianDate, Viewer } from 'cesium'
import { DistanceSurfaceMeasure } from 'cesium-extends'
import { getDistances } from '../map'

export function createDistanceMeasure(
  viewer: Viewer,
  action: ({
    entity,
  }: {
    entity: Entity
    positions: Cartesian3[]
    distances: number[]
    vectors: Cartesian3[]
  }) => void,
) {
  const distanceMeasure = new DistanceSurfaceMeasure(viewer, {
    units: 'kilometers',
    locale: {
      start: '起点',
      area: '面积',
      total: '总计',
      formatLength: (length, unitedLength) => {
        if (length < 1000) {
          return length + '米'
        }
        return unitedLength + '千米'
      },
      formatArea: (area, unitedArea) => {
        if (area < 1000000) {
          return area + '平方米'
        }
        return unitedArea + '平方千米'
      },
    },
    drawerOptions: {
      tips: {
        init: '点击绘制',
        start: '左键添加点，右键移除点，双击结束绘制',
      },
      dynamicGraphicsOptions: {
        POINT: {
          color: Color.RED,
          pixelSize: 40,
        },
        POLYGON: {
          material: Color.RED.withAlpha(0.5),
        },
        POLYLINE: {
          material: Color.RED,
        },
        CIRCLE: {
          material: Color.RED,
        },
        RECTANGLE: {
          material: Color.RED,
        },
      },
    },

    onEnd: (entity: Entity) => {
      console.log(entity) // 测量完成回调函数，返回测量结果

      const positions = entity.polyline?.positions?.getValue(new JulianDate())
      if (!positions) return
      const { distances, vectors } = getDistances(positions)
      action({ entity, positions, distances, vectors })
    },
  })
  return distanceMeasure
}
