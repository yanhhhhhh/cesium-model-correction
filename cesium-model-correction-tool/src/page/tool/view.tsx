import {
  Button,
  Checkbox,
  Collapse,
  Form,
  InputNumber,
  Popover,
  Select,
  Space,
  Table,
  message,
} from 'antd'
import { useMemo, useState } from 'react'
import {
  cgis,
  flyToBoundingSphere,
  loadDebuggingModel,
  loadReferenceModel,
} from '@/page/map'
import { axis, editTilesTransform, getModels } from '.'
import { useAtom } from 'jotai'
import { tilesMapAtom } from '..'
import {
  applyTranslate,
  getCartographic,
  localTransform3Dtiles,
} from '../map/transform'
import { useAsyncEffect, useMemoizedFn } from 'ahooks'
import { Cartesian3, Viewer } from 'cesium'

import { createDistanceMeasure } from './util'
import { TilesMap } from '../map/type'

function ToolContent() {
  const [modelList, setModelList] = useState<
    { label: string; value: string }[]
  >([]) //模型列表
  const [currentModelName, setCurrnetModelName] = useState('') //模型地址

  const [form] = Form.useForm()
  const [tilesMap, setTilesMap] = useAtom(tilesMapAtom)
  const [calculateResult, setCalculateResult] = useState<any[]>([])
  const columns = useMemo(
    () => [
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (_, row: any) => (
          <Space size="middle">
            <a
              onClick={() => {
                if (!tilesMap?.debuggingModel) {
                  message.error('请先加载调试模型')
                  return
                }
                applyTranslate(tilesMap?.debuggingModel, row.vector)
                console.log(
                  'transform',
                  tilesMap?.debuggingModel.root.transform,
                )
              }}
            >
              应用
            </a>
          </Space>
        ),
      },
      {
        title: '向量',
        dataIndex: 'vector',
        key: 'vector',
        render: (text: Cartesian3) => {
          return text.toString()
        },
      },

      {
        title: '距离',
        dataIndex: 'distance',
        key: 'distance',
        render: (text: number) => {
          return text.toFixed(2) + '米'
        },
      },
      {
        title: 'point1',
        dataIndex: 'point1',
        key: 'point1',
        render: (text: Cartesian3) => {
          return text.toString()
        },
      },
      {
        title: 'point2',
        dataIndex: 'point2',
        key: 'point2',
        render: (text: Cartesian3) => {
          return text.toString()
        },
      },
    ],
    [tilesMap],
  )
  const startCalculation = useMemoizedFn(() => {
    const distanceMeasure = createDistanceMeasure(
      cgis.viewer as Viewer,
      ({ distances, positions, vectors }) => {
        const res: any[] = []
        for (let i = 0; i < positions.length - 1; i++) {
          res.push({
            index: i + 1,
            point1: positions[i],
            point2: positions[i + 1],
            distance: distances[i],
            vector: vectors[i],
          })
        }
        setCalculateResult(() => {
          return res
        })
        console.log('res', res)
      },
    )

    setCalculateResult([])
    distanceMeasure.start()
  })
  async function changeReferenceModel(selectValue: {
    label: string
    value: string
  }) {
    const referenceModel = await loadReferenceModel(selectValue.value)
    setTilesMap((prev) => {
      return {
        ...prev,

        referenceModel,
      }
    })
  }
  async function changeDebuggingModel(selectValue: {
    label: string
    value: string
  }) {
    form.resetFields()
    setCurrnetModelName(selectValue.label)

    const debuggingModel = await loadDebuggingModel(selectValue.value)
    setTilesMap((prev) => {
      return {
        ...prev,
        debuggingModel,
      }
    })
    const cartographic = getCartographic(debuggingModel.root.transform)

    form.setFieldsValue({
      longitude: cartographic.longitude,
      latitude: cartographic.latitude,
      height: cartographic.height,
    })
  }

  async function submit() {
    const transform = tilesMap?.debuggingModel?.root.transform
    if (!transform) return
    console.log('submit transform', transform)
    await editTilesTransform({
      modelName: currentModelName,
      rootContent: {
        transform,
      },
    })
  }
  function clearForm() {
    form.resetFields()
  }
  type tilesMapKey = {
    [key in keyof TilesMap]-?: TilesMap[key]
  }
  function onVisibleChange(visible: boolean, key: keyof tilesMapKey) {
    if (tilesMap) {
      tilesMap[key]!.show = !visible
    }
  }
  function onTransformModel() {
    if (!tilesMap) return

    form.validateFields({ validateOnly: true }).then((values) => {
      const { rotate, scale, translate } = values
      if (rotate && rotate.axis) {
        switch (rotate.axis) {
          case 'x':
            rotate.axis = { x: 1, y: 0, z: 0 }
            break
          case 'y':
            rotate.axis = { x: 0, y: 1, z: 0 }
            break
          case 'z':
            rotate.axis = { x: 0, y: 0, z: 1 }
            break
          default:
            break
        }
      }
      const transform = {
        rotate,
        scale,
        translate,
      }
      if (!tilesMap.debuggingModel) return
      localTransform3Dtiles(tilesMap.debuggingModel, transform)
      const cartographic = getCartographic(
        tilesMap.debuggingModel.root.transform,
      )

      form.setFieldsValue({
        longitude: cartographic.longitude,
        latitude: cartographic.latitude,
        height: cartographic.height,
      })
    })
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useAsyncEffect(async () => {
    const { data } = await getModels()
    const modelList = data.map((item) => ({
      label: item,
      value: `/model/${item}/tileset.json`,
    }))
    setModelList(modelList)
    // console.log('modelList', modelList)
  }, [])
  return (
    <div className="absolute left-0 top-0 z-10 w-[420px] bg-white p-6 text-black ">
      <div className="h-[1000px] overflow-scroll">
        <div className="text-xl font-bold">工具</div>
        <Space>
          <Button size="small" type="primary" onClick={startCalculation}>
            距离测量
          </Button>
          {/* <Button type="primary" onClick={drawLine}>
          画线
        </Button> */}
        </Space>
        <Collapse
          size="small"
          items={[
            {
              key: 'result',
              label: '测量结果',
              children: (
                <Table
                  size="small"
                  rowKey={(record) => record.index}
                  columns={columns}
                  dataSource={calculateResult}
                  style={{ maxHeight: '300px', overflow: 'auto' }}
                />
              ),
            },
          ]}
        ></Collapse>
        <hr />
        <Space className="mb-4 flex align-middle " size="small">
          <div className="mr-8 text-xl font-bold">参考模型数据</div>

          <Checkbox
            onChange={(e) =>
              onVisibleChange(e.target.checked, 'referenceModel')
            }
          >
            隐藏
          </Checkbox>
          <Button
            size="small"
            type="primary"
            onClick={() => {
              if (!tilesMap) return
              tilesMap.referenceModel &&
                flyToBoundingSphere(tilesMap.referenceModel)
            }}
          >
            飞向
          </Button>
        </Space>

        <div className="flex align-middle">
          <div className="mr-9">选择模型：</div>

          <Select
            className="mr-3 w-1/3"
            labelInValue
            allowClear
            onChange={changeReferenceModel}
            size="small"
          >
            {modelList.map((item) => (
              <Select.Option value={item.value} key={item.label}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </div>
        <hr />
        <div className="mb-2 flex flex-col">
          <Space className="flex mb-2" size="small">
            <div className="mr-8 text-xl font-bold">修改模型数据</div>

            <Checkbox
              onChange={(e) =>
                onVisibleChange(e.target.checked, 'debuggingModel')
              }
            >
              隐藏
            </Checkbox>
            <Button
              type="primary"
              size="small"
              onClick={() => {
                if (!tilesMap) return
                tilesMap.debuggingModel &&
                  flyToBoundingSphere(tilesMap.debuggingModel)
              }}
            >
              飞向
            </Button>
          </Space>
        </div>
        <div className="flex align-middle">
          <div className="mr-9">选择模型：</div>

          <Select
            className="mr-3 w-1/3"
            size="small"
            labelInValue
            allowClear
            onChange={changeDebuggingModel}
          >
            {modelList.map((item) => (
              <Select.Option value={item.value} key={item.label}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </div>

        <Form
          name="basic"
          labelCol={{ span: 6 }}
          labelAlign="left"
          initialValues={{
            scale: { x: 1, y: 1, z: 1 },
            translate: { x: 0, y: 0, z: 0 },
          }}
          form={form}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          autoComplete="off"
          size="small"
        >
          <Form.Item label="经度" name="longitude">
            <InputNumber style={{ width: '100%' }} disabled />
          </Form.Item>

          <Form.Item label="纬度" name="latitude">
            <InputNumber style={{ width: '100%' }} disabled />
          </Form.Item>
          <Form.Item label="高度" name="height">
            <InputNumber style={{ width: '100%' }} disabled />
          </Form.Item>

          <Form.Item label="偏移量X" name={['translate', 'x']}>
            <InputNumber
              style={{ width: '100%' }}
              onPressEnter={onTransformModel}
            />
          </Form.Item>
          <Form.Item label="偏移量Y" name={['translate', 'y']}>
            <InputNumber
              style={{ width: '100%' }}
              onPressEnter={onTransformModel}
            />
          </Form.Item>
          <Form.Item label="偏移量Z" name={['translate', 'z']}>
            <InputNumber
              style={{ width: '100%' }}
              onPressEnter={onTransformModel}
            />
          </Form.Item>
          <Form.Item label="旋转">
            <Space.Compact>
              <Form.Item name={['rotate', 'axis']} noStyle>
                <Select placeholder="选择选择轴">
                  {axis.map((item) => (
                    <Select.Option key={item.label} value={item.value}>
                      {item.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name={['rotate', 'angle']} noStyle>
                <InputNumber
                  style={{ width: '50%' }}
                  min={-180}
                  max={180}
                  onPressEnter={onTransformModel}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item label="缩放X" name={['scale', 'x']}>
            <InputNumber
              style={{ width: '100%' }}
              onPressEnter={onTransformModel}
            />
          </Form.Item>
          <Form.Item label="缩放Y" name={['scale', 'y']}>
            <InputNumber
              style={{ width: '100%' }}
              onPressEnter={onTransformModel}
            />
          </Form.Item>
          <Form.Item label="缩放Z" name={['scale', 'z']}>
            <InputNumber
              style={{ width: '100%' }}
              onPressEnter={onTransformModel}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={submit}>
                保存
              </Button>
              <Button type="primary" onClick={clearForm}>
                清空
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
export default function Tool() {
  return (
    <>
      <Popover content={<ToolContent />} trigger="click" arrow={false}>
        <Button size="small">工具栏</Button>
      </Popover>
    </>
  )
}
