import express from "express"
const server = express()
const PORT = 8080

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

export {server}

