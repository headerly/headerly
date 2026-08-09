# URL case sensitivity

`isUrlFilterCaseSensitive` controls case sensitivity for whichever URL matcher is active: `urlFilter` or `regexFilter`.

| Value | Behavior |
| --- | --- |
| `false` | Match without case sensitivity |
| `true` | Match with case sensitivity |

The condition has its own enabled state. When disabled or absent, Headerly omits the field and Chrome uses its default value, `false`.

This setting does not change domain normalization, Punycode conversion, or URL percent encoding.
