# micro-search

## Settings:

  - `API_KEY` - Key to use for authenticating requests. All urls must have `?token=${API_KEY}`
  - `ELASTICSEARCH_HOST` - Hostname for your elasticsearch instance
  - `ELASTICSEARCH_INDEX` - Default index name
  - `ELASTICSEARCH_TYPE` - default type
  - `PAGEDATA_HOST` - Host for pagedata instance. Default: `https://cdn.pagedata.co`
  - `PAGEDATA_KEY` - Auth tokem for pagedata
  - `PAGEDATA_SEARCH_OBJECT` - Object to use for some search meta. Object can contain: index, type, id. Defaults to root of document.
  - `PAGEDATA_STATUS` - Fires hook on updates with this status. Default: `draft`
  - `INDEX_ALL` - Set to true to index entire pagedata content. Note: This only indexes the values of properties. Property names will not be indexed. Default: `true`
  - `INDEX_ALL_KEY` - Name of the key to store the above all index on. Use this as a field name when performing queries. default: `allContent`

## Endpoints:

#### POST `/add`

Payload:

  - index (optional, name of index, defaults to `ENV.ELASTICSEARCH_INDEX`)
  - type (optional, item type, defaults to `ENV.ELASTICSEARCH_TYPE`)
  - id (required, unique id/slug for item)
  - body (required, Object of key:value to index)

#### POST `/query`

Payload:

  - index (optional, name of index, defaults to `ENV.ELASTICSEARCH_INDEX`)
  - body (required, elasticsearch query. Tip: use the bodybuilder module to construct queries.)

#### DELETE `/remove`

Note: This removes all items matching the payload.

Payload:

  - index (optional, name of index, defaults to `ENV.ELASTICSEARCH_INDEX`)
  - type (optional, item type, defaults to `ENV.ELASTICSEARCH_TYPE`)

#### DELETE `/remove/single`

Payload:

  - index (optional, name of index, defaults to `ENV.ELASTICSEARCH_INDEX`)
  - type (optional, item type, defaults to `ENV.ELASTICSEARCH_TYPE`)
  - id (required, unique id/slug for item)

#### POST `/pagedata/hook`

Use as the hook in Pagedata.
