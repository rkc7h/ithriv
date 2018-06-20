# Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.4.
 
## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffoldings

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.


## Testing

### Unit testing

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### End-to-end (e2e) testing

## Run the app

### Start PostgreSQL
```BASH
$ brew services start postgresql
```
or
```BASH
$ pg_ctl -D /usr/local/var/postgres start
```

### Start ElasticSearch
```BASH
$ elasticsearch
```

### Start the backend app
In the `backend` directory, execute the following command:
```BASH
$ flask run
```

### Start the frontend app
In the `frontend` directory, execute the following commands:
```BASH
$ npm install
$ ng serve
```

### Run the e2e tests
Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
