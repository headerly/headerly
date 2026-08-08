# Import and export format

Headerly exchanges profiles as versioned JSON.

```json
{
  "version": 1,
  "profiles": [
    {
      "name": "API header",
      "enabled": true,
      "emoji": "📃",
      "ruleActionType": "modifyHeaders",
      "requestHeaderModGroups": [
        {
          "type": "checkbox",
          "items": [
            {
              "enabled": true,
              "name": "X-Environment",
              "operation": "set",
              "value": "staging"
            }
          ]
        }
      ],
      "filters": {
        "requestDomains": {
          "type": "checkbox",
          "items": [
            {
              "enabled": true,
              "value": "api.example.com"
            }
          ]
        }
      }
    }
  ]
}
```

## Export transformations

Headerly removes all internal IDs, profile-group membership, `tabIds`, `excludedTabIds`, `tabGroups`, and `excludedTabGroups`. It also replaces every synchronized Cookie Value with an empty string while retaining Domain, Path, and Name so the imported profile can synchronize against the receiving user's local Cookie.

Other values, including comments, ordinary header values, and redirect URLs, remain present.

## Import behavior

The complete document is validated before profiles are added. The `profiles` array must contain at least one profile and `version` must be supported. Headerly generates new UUIDs, so imported profiles do not reuse internal identities.

Profiles are added; they do not replace profiles with the same name. Imports containing cookie synchronization require the optional Cookies permission.

## Share links

Share links contain the exported JSON compressed with gzip and encoded as Base64URL. Compression is not encryption. Anyone with the complete link can decode its contents.
