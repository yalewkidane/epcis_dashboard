# Traceability Knowledge Graph Dashboard

Web front end for the EPCIS 2.0 traceability knowledge graph. It talks to two kinds of
services, both configured in the browser under **Settings**:

- one or more **EPCIS 2.0 repositories** (`http://host:7080/epcis/v2`), the distributed
  partner systems where visibility events are captured;
- the **traceability knowledge-graph service** (`http://host:7087`), which subscribes to
  those repositories and answers lineage questions with a single graph query.

## Pages

| Section | Page | What it does |
|---|---|---|
| Overview | Home | Architecture summary, graph and repository status, loaded demo scenarios |
| Traceability graph | Explorer | Enter any GS1 identifier; see its lineage as an interactive graph plus summary, timeline, event table and packing hierarchy. Forward / backward / both directions, depth control, shareable URL (`/traceability?id=…`) |
| | Scenario runner | Replay the clothing or canned-tuna story step by step through the EPCIS repositories (or straight into the graph) and watch the graph grow |
| | Live feed | Events arriving in the graph through its subscriptions, with source channels |
| EPCIS repository | Overview, Events, Vocabularies | Status and vocabulary counts, parameterised event browsing with paging, vocabulary lists with linked events |
| API console | Capture, Query, Subscriptions | Send documents/events (with validation), build parameterised and named queries, manage MQTT / websocket / webhook channels |
| System | Settings, Documentation, Installation, Changelog | Repository list and graph-service URL with connection tests; model and API reference |

## Running

```sh
npm install
npm start            # http://localhost:3000 (PORT in .env)
npm run build        # production build in ./build
npx serve -s build   # serve it
```

Or with Docker: `docker build -t traceability-dashboard . && docker run -p 3000:3000 traceability-dashboard`.

The default settings expect an EPCIS repository on `http://localhost:7080/epcis/v2` and the
graph service on `http://localhost:7087`. Both services must allow CORS (they do).

## Structure

```
src/
  api/            fetch wrapper and typed clients for EPCIS and the graph service
  config/         settings context (localStorage) with the repository list
  components/     layout shell, shared widgets, force-graph renderer, trace panels
  pages/          one folder per sidebar section
  theme.js        MUI theme and the role colours used by the graph
```

Built with Create React App, MUI 5 and react-force-graph-2d.
