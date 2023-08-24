# 模型矫正工具 Node 服务

模型文件存放目录：与本文件同级目录下的 `models` 文件夹，或者通过环境变量 `modelsDir` 指定。

# 运行：

```bash
pnpm install
pnpm run start
```

## API 接口

- 获取模型列表

  - 请求方式：GET
  - 请求地址：`/api/models`
  - 请求参数：无
  - 响应数据：模型文件名列表
    ```json
    ["fileName1", "fileName2", "fileName3"]
    ```

- 修改模型

  - 请求方式：POST
  - 请求地址：`/api/model`
  - 请求参数：

  ```json
  {
    // 模型文件名
    "modelName": "fileName", // 模型文件内容
    "rootContent": {
      // 例如：替换 transform 字段
      "transform": {}
    }
  }
  ```

  - 响应数据：无

- web 调试界面代码仓库地址 `https://codeup.aliyun.com/63ff1681a0c4722936fcedf1/utility/model-correction-tool/cesium-model-correction-tool`
