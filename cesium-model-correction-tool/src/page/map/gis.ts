import { Cesium3DTileset, Color, Viewer, Ion } from 'cesium'
import * as Cesium from 'cesium'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore

import { token } from '@/profile'
Ion.defaultAccessToken = token
window.Cesium = Cesium
;(window as any).tilesMap = {}
export let cgis: { viewer: Viewer } = window.cgis
// CEarth.options.selectedElementFilter = (picked: PickedInfo) => {
//   console.log(picked, '-------------')
//   // return picked.primitive
//   if (picked.id instanceof Entity) {
//     if (picked.id.billboard) {
//       return picked.id
//     } else {
//       return null
//     }
//   }
//   return (picked as any).primitive.treeModel?.root || picked.primitive
// }
/**
 * 初始化地图
 */
export function initMap() {
  if (cgis) {
    return cgis
  }
  const viewer = new Viewer(
    'cesium-map',

    {
      // 初始化，去除不需要小部件
      homeButton: false,
      fullscreenButton: false, //是否显示全屏
      infoBox: false,
      timeline: false, //是否显示时间线控件
      sceneModePicker: false, //是否显示投影方式控件
      animation: false, //是否显示动画控件
      baseLayerPicker: false, //是否显示图层选择控件
      navigationHelpButton: false, //是否显示帮助信息控件
      geocoder: false, //是否显示地名查找控件
      selectionIndicator: false, //用于在所选对象上显示指示器的小部件
    },
  )
  cgis = { viewer }

  //开启地形检测
  cgis.viewer.scene.globe.depthTestAgainstTerrain = true
  cgis.viewer.scene.globe.enableLighting = true
  //地下模式
  /* cgis.viewer.scene.screenSpaceCameraController.enableCollisionDetection = false
  cgis.viewer.scene.screenSpaceCameraController.enableTilt = true
  cgis.viewer.scene.globe.translucency.enabled = true */
  // cgis.viewer.scene.globe.translucency.frontFaceAlphaByDistance =
  //   new Cesium.NearFarScalar(400.0, 0.5, 8000, 0.9)

  cgis.viewer.scene.globe.translucency.frontFaceAlpha = 0.5
  // cgis.viewer.scene.globe.translucency.backFaceAlpha = 1

  window.cgis = cgis
  console.log('cgis', cgis)
  return cgis
}

/**
 *
 * 加载Cesium3DTileset
 * @param {*} url
 * @param {*} action
 */
export async function addTileset(
  url: string,
  option: Cesium3DTileset.ConstructorOptions,
  // action: (tileset: Cesium3DTileset) => void,
) {
  const tileset = await Cesium3DTileset.fromUrl(url, {
    ...option,
  })
  window.cgis.viewer.scene.primitives.add(tileset)
  return tileset
}

// 加载参考模型和调试模型
export async function loadModels(url: string) {
  // const primitiveCollection = cgis.primitives
  const viewer = window.cgis.viewer as Cesium.Viewer
  const primitiveCollection = viewer.scene.primitives

  if (primitiveCollection.length) {
    primitiveCollection.removeAll()
  }

  const [referenceModel, debuggingModel] = await Promise.all([
    addTileset(url, { debugWireframe: false }),
    addTileset(url, { debugWireframe: false }),
  ])

  flyToBoundingSphere(debuggingModel)

  //设置透明
  setTilesOpacity(referenceModel, 0.4)

  console.log({ referenceModel, debuggingModel })
  ;(window as any).tilesMap = { referenceModel, debuggingModel }
  return { referenceModel, debuggingModel }
}
/**
 * 加载参考模型
 * @param url
 * @returns
 */
export async function loadReferenceModel(url: string) {
  const viewer = window.cgis.viewer as Cesium.Viewer
  const primitiveCollection = viewer.scene.primitives
  if (
    primitiveCollection.length &&
    primitiveCollection.contains((window as any).tilesMap?.referenceModel)
  ) {
    primitiveCollection.remove((window as any).tilesMap.referenceModel)
  }
  const referenceModel = await addTileset(url, { debugWireframe: false })
  flyToBoundingSphere(referenceModel)
  setTilesOpacity(referenceModel, 0.4)
  ;(window as any).tilesMap.referenceModel = referenceModel
  return referenceModel
}
/**
 * 加载调试模型
 * @param url
 * @returns
 */
export async function loadDebuggingModel(url: string) {
  const viewer = window.cgis.viewer as Cesium.Viewer
  const primitiveCollection = viewer.scene.primitives
  if (
    primitiveCollection.length &&
    primitiveCollection.contains((window as any).tilesMap?.debuggingModel)
  ) {
    primitiveCollection.remove((window as any).tilesMap.debuggingModel)
  }
  const debuggingModel = await addTileset(url, { debugWireframe: false })
  flyToBoundingSphere(debuggingModel)
  ;(window as any).tilesMap.debuggingModel = debuggingModel
  return debuggingModel
}

export function flyToBoundingSphere(tiles: Cesium.Cesium3DTileset) {
  const viewer = window.cgis.viewer as Cesium.Viewer
  viewer.camera.flyToBoundingSphere(
    tiles.boundingSphere,

    {
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(0),
        Cesium.Math.toRadians(-90),
        tiles.boundingSphere.radius * 2.0,
      ),
    },
  )
}

//设置模型透明度
export function setTilesOpacity(tileset: Cesium3DTileset, opacity: number) {
  tileset.style = new Cesium.Cesium3DTileStyle({
    color: `rgba(255,255,255,${opacity})`,
  })
  return tileset
}

export function getDistance() {
  const viewer = window.cgis.viewer as Cesium.Viewer

  let dataSource = viewer.dataSources.getByName('distance')[0]
  if (!dataSource) {
    dataSource = new Cesium.CustomDataSource('distance')
    viewer.dataSources.add(dataSource) // 将DataSource添加到viewer中显示
    console.log(dataSource, 'dataSource-------')
  }

  // console.log(dataSource, 'dataSource')
  // function removeDistances() {
  //   for (let i = 0; i < positions.length - 1; i++) {
  //     const distanceEntityId = 'distance_' + i
  //     viewer.entities.removeById(distanceEntityId)
  //   }
  // }
  function calculateDistances(positions: Cesium.Cartesian3[]) {
    const distances: Array<number> = []
    // 移除之前计算的距离
    // const r = viewer.entities.removeAll()
    // console.log(r, 'r')
    // const remove =
    // dataSource.entities.values.length &&
    dataSource.entities.removeAll()

    // console.log(remove, 'remove')
    // 计算并添加新的距离实体
    for (let i = 0; i < positions.length - 1; i++) {
      const point1 = positions[i]
      const point2 = positions[i + 1]
      const distance = Cesium.Cartesian3.distance(point1, point2)
      const midpoint = Cesium.Cartesian3.midpoint(
        point1,
        point2,
        new Cesium.Cartesian3(),
      )

      const distanceEntity = new Cesium.Entity({
        position: midpoint,
        label: {
          text: distance.toFixed(2) + ' m',
          // showBackground: true,
          // backgroundColor: Cesium.Color.BLACK,
          font: '14px sans-serif',
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          // pixelOffset: new Cesium.Cartesian2(0, -30),
          scale: 1, // 设置标签的缩放比例
        },
      })
      distances.push(distance)
      dataSource.entities.add(distanceEntity)
    }

    return distances
  }
  return {
    calculateDistances,
  }
}
export function getDistances(positions: Cesium.Cartesian3[]) {
  const distances: number[] = []
  const midpoints: Cesium.Cartesian3[] = []
  //向量
  const vectors: Cesium.Cartesian3[] = []
  for (let i = 0; i < positions.length - 1; i++) {
    const point1 = positions[i]
    const point2 = positions[i + 1]
    const distance = Cesium.Cartesian3.distance(point1, point2)
    const midpoint = Cesium.Cartesian3.midpoint(
      point1,
      point2,
      new Cesium.Cartesian3(),
    )
    const vector = Cesium.Cartesian3.subtract(
      point2,
      point1,
      new Cesium.Cartesian3(),
    )
    distances.push(distance)
    midpoints.push(midpoint)
    vectors.push(vector)
  }
  return {
    distances,
    midpoints,
    vectors,
  }
}
