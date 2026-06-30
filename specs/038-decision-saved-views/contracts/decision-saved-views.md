# Decision Saved Views Contract

Saved views are browser-local objects:

```json
{
  "id": "rejected:all:3",
  "label": "rejected / All sources / 3 per page",
  "settings": {
    "status": "rejected",
    "source": "all",
    "pageSize": 3
  }
}
```

Storage key:

- `gryyk47.decisionSavedViews`

Saved views do not call backend APIs directly. Applying a view updates existing Decision Records list settings, which then use the existing read-only list API query path.

