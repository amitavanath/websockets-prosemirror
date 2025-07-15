import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo } from 'y-prosemirror';
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { keymap } from 'prosemirror-keymap';
import { exampleSetup } from 'prosemirror-example-setup';
import { Node as ProseMirrorNode } from 'prosemirror-model';

// Yjs setup
const ydoc = new Y.Doc();
const provider = new WebsocketProvider('ws://localhost:4321', 'my-room', ydoc);
const yXmlFragment = ydoc.getXmlFragment('prosemirror');

provider.awareness.setLocalStateField('user', {
  name: 'Amit',
  color: '#ffa500',
});

provider.once('synced', () => {
  if (yXmlFragment.length === 0) {
    const initialContent = ProseMirrorNode.fromJSON(schema, {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Start writing collaboratively...' }]
        }
      ]
    });

    yXmlFragment.insert(0, [initialContent]);
  }
});

const state = EditorState.create({
  schema,
  plugins: [
    ySyncPlugin(yXmlFragment),
    yCursorPlugin(provider.awareness),
    yUndoPlugin(),
    keymap({ 'Mod-z': undo, 'Mod-y': redo }),
    ...exampleSetup({ schema }),
  ],
});

new EditorView(document.querySelector('#editor'), { state });
