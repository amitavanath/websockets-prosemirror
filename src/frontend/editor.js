import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo } from 'y-prosemirror'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { keymap } from 'prosemirror-keymap'
import { exampleSetup } from 'prosemirror-example-setup'
import { Schema, Node as ProseMirrorNode } from 'prosemirror-model'
import { schema as basicSchema } from 'prosemirror-schema-basic'
import { addListNodes } from 'prosemirror-schema-list'
import 'prosemirror-view/style/prosemirror.css'
import 'prosemirror-menu/style/menu.css'
import './awarenesscursor.css';



// 1. Create schema with list support
const mySchema = new Schema({
  nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'),
  marks: basicSchema.spec.marks,
})

// 2. Yjs setup
const ydoc = new Y.Doc()
const provider = new WebsocketProvider('ws://localhost:4321', 'my-room', ydoc)
const yXmlFragment = ydoc.getXmlFragment('prosemirror')

// 3. Awareness (for collaborative cursors)
provider.awareness.setLocalStateField('user', {
  name: 'Amit',
  color: '#ffa500',
})

// 4. Insert initial content if empty
provider.once('synced', () => {
  if (yXmlFragment.length === 0) {
    const initialContent = ProseMirrorNode.fromJSON(mySchema, {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Start writing collaboratively with lists...' }],
        },
        {
          type: 'bullet_list',
          content: [
            {
              type: 'list_item',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First item' }] }],
            },
            {
              type: 'list_item',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Second item' }] }],
            },
          ],
        },
      ],
    })
    yXmlFragment.insert(0, [initialContent])
  }
})

// 5. Initialize editor view with full plugins (including menu bar)
const state = EditorState.create({
  schema: mySchema,
  plugins: [
    ySyncPlugin(yXmlFragment),
    yCursorPlugin(provider.awareness),
    yUndoPlugin(),
    keymap({ 'Mod-z': undo, 'Mod-y': redo }),
    ...exampleSetup({ schema: mySchema }), // <- menu bar is enabled here
  ],
})

new EditorView(document.querySelector('#editor'), { state })
