import request from '@/request'
import { Matrix4 } from 'cesium'
type EditTilesTransformParams = {
  modelName: string
  rootContent: {
    transform: Matrix4
  }
}
export function getModels() {
  return request.get<string[]>('/api/models')
}
export function editTilesTransform(params: EditTilesTransformParams) {
  return request.post('/api/model', params)
}
