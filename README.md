# micro-search

## Settings:

  - `API_KEY` - Key to use for authenticating requests. All urls must have `?token=${API_KEY}`
  - `ELASTICSEARCH_HOST` - Hostname for your elasticsearch instance
  - `ELASTICSEARCH_INDEX` - Default index name
  - `PAGEDATA_HOST` - Host for pagedata instance. Default: `https://cdn.pagedata.co`
  - `PAGEDATA_KEY` - Auth token for pagedata
  - `PAGEDATA_SEARCH_OBJECT` - Object to use for some search meta. Object can contain: index, type, id. Defaults to root of document.
  - `PAGEDATA_STATUS` - Fires hook on updates with this status. Default: `draft`
  - `INDEX_ALL` - Set to true to index entire pagedata content. Note: This only indexes the values of properties. Property names will not be indexed. Default: `true`
  - `INDEX_ALL_KEY` - Name of the key to store the above all index on. Use this as a field name when performing queries. default: `allContent`

#### Note on Types:

New versions of elasticsearch no longer allow for custom types. To preserve a similar behavior, you can still pass in a type but this will be copied to the body object as body.contentType. The ideal way to handle multiple types is by using a different index for each type.

When upgrading from older micro-search you'll need to re-index for the contentType field to be generated.

## Endpoints:

#### POST `/add`

Payload:

  - index (optional, name of index, defaults to `ENV.ELASTICSEARCH_INDEX`)
  - type (optional, item type)
  - id (required, unique id/slug for item)
  - body (required, Object of key:value to index)

#### POST `/query`

Payload:

  - index (optional, name of index, defaults to `ENV.ELASTICSEARCH_INDEX`)
  - body (required, elasticsearch query. Tip: use the bodybuilder module to construct queries.)

#### GET `/complete`

Query:

  - token (access token)
  - index (optional, name of index, defaults to `ENV.ELASTICSEARCH_INDEX`)
  - field (required, name of suggestor field. See note below regarding indexes)
  - q (required, text to use for completion)

#### DELETE `/remove`

Note: This removes all items matching the payload.

Payload:

  - index (optional, name of index, defaults to `ENV.ELASTICSEARCH_INDEX`)
  - type (optional, item type)

#### DELETE `/remove/single`

Payload:

  - index (optional, name of index, defaults to `ENV.ELASTICSEARCH_INDEX`)
  - type (optional, item type)
  - id (required, unique id/slug for item)

#### POST `/pagedata/hook`

Use as the hook in Pagedata.

#### Indexes

In order to use completion you must setup mappings. This only has to be done once. `field_name` should be the name of the field you will use for completion. When indexing items, you'll also need to add a field called `<field_name>_suggest`. In most cases it would just be the field duplicated, such as a `name` field.

Example:

http PUT <url of elasticsearch>:9200/<index>

body:
```json
{
  "mappings": {
    "<type>": {
      "properties": {
        "<field_name>_suggest": {
          "type": "completion"
        }
      }
    }
  }
}
```

in action:
```json
{
  "mappings": {
    "book": {
      "properties": {
        "name_suggest": {
          "type": "completion"
        }
      }
    }
  }
}
```

http post /add

```json
{
  "type": "book",
  "id": "book1",
  "body": {
    "name": "Amazing Book",
    "name_suggest": "Amazing Book"
  }
}
```
