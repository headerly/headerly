import type { Profile } from "../schema";

export const mockProfile: Profile = {
  ruleScope: "dynamic",
  ruleActionType: "modifyHeaders",
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Test Profile",
  enabled: true,
  emoji: "🔒",
  groupId: "550e8400-e29b-41d4-a716-446655440099",
  comments: "Test profile for unit tests",
  priority: 5,
  requestHeaderModGroups: [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      type: "checkbox",
      items: [
        {
          id: "550e8400-e29b-41d4-a716-446655440002",
          enabled: true,
          comments: "Test header mod",
          name: "X-Custom-Header",
          operation: "set",
          value: "test-value",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440003",
          enabled: true,
          comments: "Remove header",
          name: "X-Remove-Header",
          operation: "remove",
        },
      ],
    },
  ],
  responseHeaderModGroups: [
    {
      id: "550e8400-e29b-41d4-a716-446655440004",
      type: "radio",
      items: [
        {
          id: "550e8400-e29b-41d4-a716-446655440005",
          enabled: true,
          comments: "Response header mod",
          name: "X-Response-Header",
          operation: "append",
          value: "response-value",
        },
      ],
    },
  ],
  syncCookieGroups: [
    {
      id: "550e8400-e29b-41d4-a716-446655440006",
      type: "checkbox",
      items: [
        {
          id: "550e8400-e29b-41d4-a716-446655440007",
          enabled: true,
          comments: "Test cookie",
          domain: "example.com",
          name: "test-cookie",
          value: "cookie-value",
          path: "/",
        },
      ],
    },
  ],
  redirectUrlGroup: [
    {
      id: "550e8400-e29b-41d4-a716-446655440018",
      enabled: true,
      comments: "Redirect URL",
      value: "https://redirect.example.com/",
    },
  ],
  filters: {
    urlFilter: [
      {
        id: "550e8400-e29b-41d4-a716-446655440008",
        enabled: true,
        comments: "URL filter",
        value: "https://example.com/*",
      },
    ],
    regexFilter: [
      {
        id: "550e8400-e29b-41d4-a716-446655440009",
        enabled: true,
        comments: "Regex filter",
        value: ".*\\.example\\.com.*",
      },
    ],
    initiatorDomains: {
      type: "checkbox",
      items: [
        {
          id: "550e8400-e29b-41d4-a716-446655440010",
          enabled: true,
          comments: "Initiator domain",
          value: "example.com",
        },
      ],
    },
    excludedInitiatorDomains: {
      type: "radio",
      items: [
        {
          id: "550e8400-e29b-41d4-a716-446655440011",
          enabled: true,
          comments: "Excluded initiator domain",
          value: "bad-site.com",
        },
      ],
    },
    requestDomains: {
      type: "checkbox",
      items: [
        {
          id: "550e8400-e29b-41d4-a716-446655440012",
          enabled: true,
          comments: "Request domain",
          value: "api.example.com",
        },
      ],
    },
    excludedRequestDomains: {
      type: "radio",
      items: [
        {
          id: "550e8400-e29b-41d4-a716-446655440013",
          enabled: true,
          comments: "Excluded request domain",
          value: "malicious.com",
        },
      ],
    },
    topDomains: {
      type: "checkbox",
      items: [
        {
          id: "550e8400-e29b-41d4-a716-446655440024",
          enabled: true,
          comments: "Top domain",
          value: "app.example.com",
        },
      ],
    },
    excludedTopDomains: {
      type: "radio",
      items: [
        {
          id: "550e8400-e29b-41d4-a716-446655440025",
          enabled: true,
          comments: "Excluded top domain",
          value: "embed.example.com",
        },
      ],
    },
    resourceTypes: [
      {
        id: "550e8400-e29b-41d4-a716-446655440014",
        enabled: true,
        comments: "Resource types filter",
        value: ["script", "stylesheet"],
      },
    ],
    excludedResourceTypes: [
      {
        id: "550e8400-e29b-41d4-a716-446655440015",
        enabled: true,
        comments: "Excluded resource types",
        value: ["image", "font"],
      },
    ],
    requestMethods: [
      {
        id: "550e8400-e29b-41d4-a716-446655440016",
        enabled: true,
        comments: "Request methods filter",
        value: ["get", "post"],
      },
    ],
    excludedRequestMethods: [
      {
        id: "550e8400-e29b-41d4-a716-446655440017",
        enabled: true,
        comments: "Excluded request methods",
        value: ["delete", "patch"],
      },
    ],
    domainType: {
      enabled: true,
      value: "firstParty",
    },
    isUrlFilterCaseSensitive: {
      enabled: false,
      value: true,
    },
  },
};
