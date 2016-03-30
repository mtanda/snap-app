Snap-app is an experimental app to allow Grafana to function as a web-based frontend for Snap servers.

### Current Features
- list snap tasks configured on a snapd server.
- start, stop, create and delete tasks
- list metrics available on a snapd server
- "Watch" tasks, where the metrics collected are pushed to a Grafana panel in real time.

### Uasage
The app currently includes a *snap* datasource.  
- To get started, you will first need to add a datsource of type "Snap DS".
  - In the datasource settings, the URL should be the url of the Snapd api. eg. "http://localhost:8181/"
- Next, on an existing or new dashboard, add a graph panel.
- In the query editor ensure the "snap" datasource is being used.
- you can then select an existing task to watch, or create a new task.
  - to create a new task, type the name of the task in the "task name" field
  - select the metrics of interest from the "Metric" field, using the "+" button to add additional metrics
  - on the "actions" line, click "Create" to create the new task.
- Click the "watch" button on the "actions" line to have metrics pushed to the panel in real time.


### Installation
Use the new grafana-cli tool to install raintank-snap-app from the commandline:

```
grafana-cli plugins install raintank-snap-app
```

The plugin will be installed into your grafana plugins directory; the default is /var/lib/grafana/plugins if you installed the grafana package.

More instructions on the cli tool can be found [here](http://docs.grafana.org/v3.0/plugins/installation/).

You need the lastest grafana build for Grafana 3.0 to enable plugin support. You can get it here : http://grafana.org/download/builds.html
