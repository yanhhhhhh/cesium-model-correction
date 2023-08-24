import { readFile, readdir, stat, writeFile } from 'fs/promises'

import express, { Request } from 'express'
import minimist from 'minimist'

import { ModelUpdateProps } from './types'

const router = express.Router()

const { modelsDir } = minimist(process.argv.slice(2))
const dir = modelsDir ?? './models'

router.get('/models', async (req, res) => {
  try {
    const files = await readdir(dir)
    const dirs = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const path = `${dir}/${file}`

      const isDir = await stat(path).then((stats) => stats.isDirectory())

      if (isDir) {
        dirs.push(file)
      }
    }

    res.status(200).json(dirs)
  } catch (error) {
    res
      .status(500)
      .json({ message: '查询模型文件失败，请确认模型文件夹是否存在。' })
  }
})

router.post('/model', async (req: Request<{}, {}, ModelUpdateProps>, res) => {
  const { modelName, rootContent } = req.body

  if (!modelName || !rootContent) {
    res.status(400).json({ message: 'missing model name or root content' })
  }

  try {
    const file = await readFile(`${dir}/${modelName}/tileset.json`, 'utf-8')
    const fileJSON = JSON.parse(file) as Record<string, any>

    Object.keys(rootContent).forEach((key) => {
      fileJSON.root[key] = rootContent[key]
    })

    await writeFile(
      `${dir}/${modelName}/tileset.json`,
      JSON.stringify(fileJSON, null, 2),
    )

    res.json({ message: 'done' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'update tileset.json failed' })
  }
})

export default router
