import * as Cesium from 'cesium'

/**
 * 局部旋转
 * @param {*} matrix
 * @param {*} transform
 * @returns
 */
function localTransform(matrix: Cesium.Matrix4, transform: any) {
  const { rotate } = transform
  let { translate, scale } = transform
  translate = translate
    ? Cesium.Cartesian3.clone(translate)
    : Cesium.Cartesian3.ZERO.clone()
  let quat = Cesium.Quaternion.IDENTITY.clone()
  if (rotate && rotate.angle) {
    const axis = Cesium.Cartesian3.clone(rotate.axis)
    const angle = Cesium.Math.toRadians(rotate.angle)
    quat = Cesium.Quaternion.fromAxisAngle(axis, angle)
  }
  scale = Cesium.Cartesian3.clone(scale ?? { x: 1, y: 1, z: 1 })

  const locMat = Cesium.Matrix4.fromTranslationQuaternionRotationScale(
    translate,
    quat,
    scale,
  )
  return Cesium.Matrix4.multiply(matrix, locMat, new Cesium.Matrix4())
}

/**
 * 局部旋转3Dtiles
 * @param {*} titles
 * @param {*} transform
 * @returns
 */
export function localTransform3Dtiles(
  titles: Cesium.Cesium3DTileset,
  transform: any,
) {
  return (titles.root.transform = localTransform(
    titles.root.transform,
    transform,
  ))
}

/**
 * 获取矩阵中携带的经纬度
 * @param {*} matrix
 * @returns
 */
export function getCartographic(matrix: Cesium.Matrix4) {
  const cartesian3 = new Cesium.Cartesian3(matrix[12], matrix[13], matrix[14])
  const cart = Cesium.Cartographic.fromCartesian(cartesian3)

  return {
    longitude: Cesium.Math.toDegrees(cart.longitude),
    latitude: Cesium.Math.toDegrees(cart.latitude),
    height: cart.height,
  }
}

/**
 * 对3dtileset 应用世界平移
 * @param {*} tileset
 * @param {*} translate
 */
export function applyTranslate(
  tileset: Cesium.Cesium3DTileset,
  translate: { x: number; y: number; z: number },
) {
  const mat = tileset.root.transform as any
  mat[12] += translate.x
  mat[13] += translate.y
  mat[14] += translate.z
}

/**
 * 获取两个矩阵之间的变换
 * @param {*} from
 * @param {*} to
 * @returns
 */
export function getDiffMatrix(from: Cesium.Matrix4, to: Cesium.Matrix4) {
  const fromInv = Cesium.Matrix4.clone(from)
  Cesium.Matrix4.inverse(fromInv, fromInv)
  const trans = Cesium.Matrix4.clone(to)
  Cesium.Matrix4.multiply(trans, fromInv, trans)
  return Cesium.Matrix4.toArray(trans)
}

/**
 * 对3Dtileset应用一个变换
 * @param {*} tileset
 * @param {*} matrix
 * @returns
 */
export function applyMatrixOn3Dtiles(
  tileset: Cesium.Cesium3DTileset,
  matrix: Cesium.Matrix4,
) {
  const mat = Cesium.Matrix4.fromArray(matrix)
  const trans = tileset.root.transform
  Cesium.Matrix4.multiply(mat, trans, trans)
  return trans
}
