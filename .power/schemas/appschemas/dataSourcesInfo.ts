/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This file is auto-generated. Do not modify it manually.
 * Changes to this file may be overwritten.
 */

export const dataSourcesInfo = {
  "decisionlog": {
    "tableId": "DecisionLog",
    "version": "",
    "primaryKey": "ID",
    "dataSourceType": "Connector",
    "apis": {
      "GetDecision": {
        "path": "/{connectionId}/datasets/{dataset}/tables/{tableName}/entities/Decision",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "dataset",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "tableName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "GetAISuggestionUsed": {
        "path": "/{connectionId}/datasets/{dataset}/tables/{tableName}/entities/AISuggestionUsed",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "dataset",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "tableName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "GetAuthor": {
        "path": "/{connectionId}/datasets/{dataset}/tables/{tableName}/entities/Author",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "dataset",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "tableName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "GetEditor": {
        "path": "/{connectionId}/datasets/{dataset}/tables/{tableName}/entities/Editor",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "dataset",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "tableName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "Get4651e8f238c94ad08def41f743f76f30": {
        "path": "/{connectionId}/datasets/{dataset}/tables/{tableName}/entities/4651e8f238c94ad08def41f743f76f30",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "dataset",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "tableName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      }
    }
  },
  "requests": {
    "tableId": "Requests",
    "version": "",
    "primaryKey": "ID",
    "dataSourceType": "Connector",
    "apis": {
      "GetRequestType": {
        "path": "/{connectionId}/datasets/{dataset}/tables/{tableName}/entities/RequestType",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "dataset",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "tableName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "GetEffort": {
        "path": "/{connectionId}/datasets/{dataset}/tables/{tableName}/entities/Effort",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "dataset",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "tableName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "GetDataSensitivity": {
        "path": "/{connectionId}/datasets/{dataset}/tables/{tableName}/entities/DataSensitivity",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "dataset",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "tableName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "GetStatus": {
        "path": "/{connectionId}/datasets/{dataset}/tables/{tableName}/entities/Status",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "dataset",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "tableName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "GetAuthor": {
        "path": "/{connectionId}/datasets/{dataset}/tables/{tableName}/entities/Author",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "dataset",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "tableName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "GetEditor": {
        "path": "/{connectionId}/datasets/{dataset}/tables/{tableName}/entities/Editor",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "dataset",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "tableName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      },
      "Get4651e8f238c94ad08def41f743f76f30": {
        "path": "/{connectionId}/datasets/{dataset}/tables/{tableName}/entities/4651e8f238c94ad08def41f743f76f30",
        "method": "GET",
        "parameters": [
          {
            "name": "connectionId",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "dataset",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "tableName",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "search",
            "in": "query",
            "required": false,
            "type": "string"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "array"
          }
        }
      }
    }
  }
};
