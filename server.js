import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import crypto from "crypto"
import { MongoClient, ObjectId } from "mongodb"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME
const PORT = process.env.PORT

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

let db

// [ Route ] Fetch all lists
app.get('/api/lists', async (req, res) => {
  try {
    const lists = await db.collection("lists").find({}).toArray()
    res.status(200).json(lists)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// [ Route ] Add a new list
app.post('/api/lists', async (req, res) => {
  try {
    const { title } = req.body
    if (!title) {
      return res.status(400).json({ error: "title is required" })
    }

    const list = {
      title: title,
      entries: []
    }

    const result = await db.collection("lists").insertOne(list)

    res.status(201).json({ _id: result.insertedId, list: list })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// [ Route ] Fetching a single list
app.get('/api/lists/:id', async (req, res) => {
  try {
    const _id = new ObjectId(req.params.id)

    if (!_id) {
      return res.status(404).json({ error: 'list not found' })
    }

    const list = await db.collection('lists').findOne({ _id: _id})

    if (!list) {
      return res.status(404).json({ error: 'list not found' })
    }

    return res.status(200).json(list)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// [ Route ] Delete a list
app.delete('/api/lists/:id', async (req, res) => {
  try {
    const _id = new ObjectId(req.params.id)

    if (!_id) return res.status(404).json({ error: 'list not found' })

    const result = await db.collection("lists").deleteOne({ _id: _id })

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'list not found' })
    }

    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// [ Route ] Add a list text entry
app.post('/api/lists/:id/entries', async (req, res) => {
  try {
    const _id = new ObjectId(req.params.id)

    if (!_id) {
      return res.status(404).json({ error: 'list not found' })
    }

    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: 'text is required' })
    }

    const entry = { id: crypto.randomUUID(), text: text.trim(), status: false }

    const updatedList = await db.collection("lists").findOneAndUpdate(
      { _id },
      { $push: { entries: entry } },
      { returnDocument: 'after' }
    )

    if (!updatedList) return res.status(404).json({ error: 'list not found' })

    res.status(201).json(updatedList)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// [ Route ] Update a complete status of a text entry
app.patch('/api/lists/:id/entries/:entryId', async (req, res) => {
  try {
    const _id = new ObjectId(req.params.id)

    if (!_id) return res.status(404).json({ error: 'list not found' })

    const { status } = req.body;

    if (typeof status !== 'boolean') {
      return res.status(400).json({ error: 'status is required' })
    }

    const updatedList = await db.collection("lists").findOneAndUpdate(
      { _id, 'entries.id': req.params.entryId },
      { $set: { 'entries.$.status': status } },
      { returnDocument: 'after' }
    )

    if (!updatedList) {
      return res.status(404).json({ error: 'list or text entry not found' })
    }

    res.status(200).json(updatedList)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// [ Route ] Delete a list text entry
app.delete('/api/lists/:id/entries/:entryId', async (req, res) => {
  try {
    const _id = new ObjectId(req.params.id)

    if (!_id) {
      return res.status(404).json({ error: 'list not found' })
    }

    const updatedList = await db.collection("lists").findOneAndUpdate(
      { _id },
      { $pull: { entries: { id: req.params.entryId } } },
      { returnDocument: 'after' }
    )

    if (!updatedList) {
      return res.status(404).json({ error: 'list not found' })
    }

    res.status(200).json(updatedList)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const start = async () => {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db(DB_NAME);
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

try {
  start()
} catch (error) {
  console.error('Failed to start server:', error);
}
