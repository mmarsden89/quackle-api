### duckPics

duckPics is an instagram clone where users can upload photos of rubberducks, comment on others posts as well as follow other users

### screenshot
![duckPics](https://i.imgur.com/mvKkpPD.png "duckPics")

#### links
[front-end deployed](https://mmarsden89.github.io/duckPics-client/#/)

[back-end deployed](https://duck-pics.herokuapp.com/)

[front-end repo](https://github.com/mmarsden89/duckPics-client)

[back-end repo](https://github.com/mmarsden89/duckPics-api)

#### technologies

bootstrap - handlebars - react - express - mongoose - git - AWS - fontawesome - moment.js

#### future iterations

in version 2, I plan to implement a messaging system as well as a "stories" feature

#### installation instructions

1. Fork and clone this repo
2. Install dependencies with npm install

#### erd
[ERD](https://i.imgur.com/mecmDeE.jpg)

## API Route Catalog:

### uploads
| Verb    | URI Pattern           | Route Action                    |
|---------|-----------------------|---------------------------------|
| POST    | `/uploads`           | `router.create(/uploads)`      |
| GET     | `/uploads`           | `router.index(/uploads)`       |
| GET     | `/uploads/:id`       | `router.show(/uploads/:id)`    |
| PATCH   | `/uploads/:id`       | `router.patch(/uploads/:id)`   |
| PATCH   | `/likes/:id`       | `router.patch(/likes/:id)`   |   |   |   |
| DELETE  | `/uploads/:id`       | `router.delete(/uploads/:id)`  |


### comments
| Verb    | URI Pattern           | Route Action      |
|---------|-----------------------|-------------------|
| POST    | `/comments`              | `create`          |
| GET     | `/comments`              | `comments#index`     |
| GET     | `/comments/:id`          | `comments#show`      |
| PATCH   | `/comments/:id`          | `comments#update`    |
| DELETE  | `/comments/:id`          | `comments#destroy`   |

### User
| Verb   | URI Pattern            | Controller#Action             |
|--------|------------------------|-------------------------------|
| POST   | `/sign-up`             | `users.post/sign-up`          |
| POST   | `/sign-in`             | `users.post/sign-in`          |
| PATCH  | `/change-password`     | `users.patch/change-password` |
| DELETE | `/sign-out`            | `users.delete/sign-out`       |
| PATCH | `/follow/:id`            | `users.patch/follow/:id`       |
