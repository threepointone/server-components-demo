import itty from 'itty-router';
import {renderToReadableStream as flightRenderToReadableStream} from 'react-server-dom-webpack/writer.browser.server';
import React from 'react';
import ReactApp from './App.server';
import * as simple from './simple-notes-db';
import {renderToReadableStream as fizzRenderToReadableStream} from 'react-dom/server.browser';
import Html from './Html';

import manifest from '../dist/react-client-manifest.json';
// create a router
const app = itty.Router();

function onError(error) {
  console.error(error.message);
  console.error(error.stack);
  return new Response(error.message || 'Server Error', {
    status: error.status || 500,
  });
}

function sleep(n) {
  return new Promise((resolve) => setTimeout(resolve, n));
}

// home page html
app.get('/', async () => {
  let controller = new AbortController();
  try {
    const stream = await fizzRenderToReadableStream(<Html />, {
      signal: controller.signal,
    });
    await stream.allReady;
    return new Response(stream, {
      headers: {'Content-Type': 'text/html'},
    });
  } catch (err) {
    console.error('Server error:', err);
    return new Response(
      '<!doctype html><p>Loading...</p><script src="/index.js"></script>',
      {
        status: 500,
        headers: {'Content-Type': 'text/html'},
      }
    );
  }
});

async function sendResponse(req, redirectToId) {
  const location = JSON.parse(req.query.location);
  if (redirectToId) {
    location.selectedId = redirectToId;
  }

  const response = flightRenderToReadableStream(
    <ReactApp
      {...{
        selectedId: location.selectedId,
        isEditing: location.isEditing,
        searchText: location.searchText,
      }}
    />,
    manifest,
    {
      onError(err) {
        // ? throw?
      },
    }
  );

  return new Response(response, {
    status: 200,
    headers: {
      'X-Location': JSON.stringify(location),
      'content-type': 'text/html;charset=UTF-8',
    },
  });
}

app.get('/react', async (req) => {
  return sendResponse(req, null);
});

app.post('/notes', async (req) => {
  const {title, body} = await req.json();
  const note = await simple.create({title, body});
  const insertedId = note.id;
  return sendResponse(req, insertedId);
});

app.put('/notes/:id', async (req) => {
  const now = new Date();
  const updatedId = Number(req.params.id);
  const {title, body} = await req.json();
  await simple.update({title, body, id: updatedId});
  return sendResponse(req, null);
});

app.delete('/notes/:id', async (req) => {
  await simple.del(Number(req.params.id));
  return sendResponse(req, null);
});

app.get('/notes', async (req) => {
  const rows = await simple.list();
  return new Response(JSON.stringify(rows), {
    headers: {
      'content-type': 'application/json',
    },
  });
});

app.get('/notes/:id', async (req) => {
  const row = await simple.read(Number(req.params.id));
  return new Response(JSON.stringify(row), {
    headers: {
      'content-type': 'application/json',
    },
  });
});

app.get('/sleep/:ms', async function (req) {
  await sleep(req.params.ms);
  return new Response(JSON.stringify({ok: true}), {
    headers: {
      'content-type': 'application/json',
    },
  });
});

// probably a static asset, fetch from Pages
// app.get('*', async (request) => {
//   return fetch(req);
// });

export default {
  async fetch(request) {
    if (
      request.url.endsWith('.js') ||
      request.url.endsWith('.css') ||
      request.url.endsWith('.svg') ||
      request.url.endsWith('.map')
    ) {
      return fetch(request);
    }
    return app.handle(request).catch(onError);
  },
};
