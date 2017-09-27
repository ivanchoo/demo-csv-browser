## CSV Browser Demo

![Preview](https://raw.githubusercontent.com/ivanchoo/demo-csv-browser/master/frontend/src/assets/intro.gif)

A web application that loads a CSV and enables searching through a large dataset to quickly locate data of interest. Build with React ⚛ & Python 🐍..

### Goal

This project is build an web application that:

 - Accepts a CSV file of a predefined format (presumably log entries for tracking object changes)
 - Allow users to query the dataset for the state of objects
   - At specific point in time
   - Base on specific attributes like `object_type`, `object_id` or both

### Instructions

The best way to run this project locally using Docker.

Install and start Docker via command line.

```
$ docker-machine start
$ eval $(docker-machine env)
```

Take note of the IP address which docker machine runs in (you'll need it later).

```
$ docker-machine ip
```

Checkout this project and start the Docker containers.

```
$ cd demo-csv-browser
$ docker-compose build
$ docker-compose up -d
```

The project will run the following Docker containers:

 - `frontend`: Runs a webpack dev server with hot-reload enabled.
 - `server`: Runs a python flask server with hot-reload enabled.
 - `database`: Runs a PostgreSQL server. To access the database, use `docker-compose exec database psql -U app`

This will setup a development environment for the current project. To view the project in the browser, you'll need the Docker IP and access it at port `8000`, example `http://[docker-machine-ip]:8000/`

To stop the project, use

```
$ docker-compose down
```

### Design

Several design considerations are taken into account when designing this app.

 - Users typically have no visibility to the time period of events within the log (CSV) file. Providing this information can quickly enable users to narrow the scope of search
 - Users will begin the search process without knowledge of the specific time the event occurred. They usually have a broad range in mind (e.g. happened last quarter, last 1/2 year)
 - Co-relating events is a very common use case in such operations, e.g. searching for event `Invoice:231` that is part of an order event `Order:45`

### Others

Please use issues for suggestions and bug reports.
