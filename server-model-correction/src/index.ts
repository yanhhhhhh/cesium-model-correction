import path from 'path'

import express, { Express } from 'express'

import routes from './routes'

const app: Express = express()

// static server
const htmlStaticPath: string = path.join(__dirname, '../public')
const modelStaticPath: string = path.join(__dirname, '../models')

app.use(express.static(htmlStaticPath))
app.use('/model', express.static(modelStaticPath))

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Routes
app.use('/api', routes)

const port: number = 3000

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
