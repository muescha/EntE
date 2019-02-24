_EntE_ is configured through a docker-app config file.

# Example Config File

```yml
config:
  baseUrl: https://ente.simonknott.de
  port: 80
  rotation_period:
    keys: 900
    ui: 300

sentry: # sentry DSNs, optional
  api: my_sentry_dsn_api
  ui: my_sentry_dsn_ui

mysql: # mysql config
  host:
  port:
  username:
  password:
  database:
  timezone: "+01:00" # timezone of the database, specified as in ISO 8601

smtp: # smtp config
  host:
  port:
  username:
  password:
  address: ente@simonknott.de # address that is used ("ente@simonknott.de")
  sender: Example-EntE # display of address ("EntE")
```