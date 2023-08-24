import { Viewer } from "cesium"

declare global {
  interface Window {
    CESIUM_BASE_URL: string
    cgis: any
    Cesium: any
    viewer: Viewer
    CEarth: any
  }
}
export default {}