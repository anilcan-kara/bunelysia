import { Elysia, t } from 'elysia';
import { PrismaClient } from '@prisma/client';
import { swagger } from '@elysiajs/swagger';
import { ip } from 'elysia-ip';

const info = {
  title: 'Bunelysia API',
  description: 'Nextgen API with Socket+REST developement guide for endpoints',
  version: '1.2.0',
};

const setup = (app) => app.decorate('db', new PrismaClient());

const app = new Elysia({
  websocket: {
    idleTimeout: 30,
  },
})
  .use(ip())
  .ws('/ws', {
    body: t.Object({
      message: t.String(),
    }),
    message(ws, message) {
      ws.send({ message, time: Date.now() });
    },
  })
  .use(swagger({ path: '/api-reference', documentation: { info } }))
  .use(setup)
  .group('/search', (app) => {
    return app
      .get('', ({ query, db }) => db.movie.findMany(), {
        detail: { tags: ['search'] },
      })
      .guard({ schema: { query: t.Object({ q: t.String() }) } }, (app) =>
        app
          .get(
            '/movie',
            ({ query, db }) => {
              return db.movie.findMany({
                where: { title: { contains: query.q } },
              });
            },
            { detail: { tags: ['search'] } }
          )
          .get(
            '/tv',
            ({ query, db }) => {
              return db.movie.findMany({
                where: { title: { contains: query.q }, type: 'series' },
              });
            },
            { detail: { tags: ['search'] } }
          )
          .get(
            '/person',
            ({ query, db }) => {
              return db.person.findMany({
                where: { name: { contains: query.q } },
              });
            },
            { detail: { tags: ['search'] } }
          )
          // .get("/company", ({ query }) => `query: ${query.q}`, {
          // detail: { tags: ['search'] },
          // })
          .get(
            '/episode',
            ({ query, db }) => {
              return db.episode.findMany({
                where: { title: { contains: query.q } },
              });
            },
            { detail: { tags: ['search'] } }
          )
          .get(
            '/review',
            ({ query, db }) => {
              return db.review.findMany({
                where: { comment: { contains: query.q } },
              });
            },
            { detail: { tags: ['search'] } }
          )
          .get(
            '/award',
            ({ query, db }) => {
              return db.award.findMany({
                where: { name: { contains: query.q } },
              });
            },
            { detail: { tags: ['search'] } }
          )
      );
  })
  .group('/title/:id', (app) =>
    app.guard({ schema: { params: t.Object({ id: t.Number() }) } }, (app) => {
      return app
        .get(
          '',
          async ({ params, db }) => {
            const id = Number(params.id);
            if (isNaN(id)) {
              throw new Error('Invalid id');
            }
            const movie = await db.movie.findUnique({ where: { id } });
            if (!movie) {
              throw new Error('Movie not found');
            }
            return movie;
          },
          { detail: { tags: ['title'] } }
        )
        .group('/episodes', (app) =>
          app
            .get(
              '',
              ({ params, db }) => {
                const movieId = Number(params.id);
                if (isNaN(movieId)) {
                  throw new Error('Invalid movieId');
                }
                return db.episode.findMany({
                  where: { movieId },
                });
              },
              { detail: { tags: ['title', 'episodes'] } }
            )
            .group('/:episodeId', (app) =>
              app.guard(
                { schema: { params: t.Object({ episodeId: t.Number() }) } },
                (app) =>
                  app.get(
                    '',
                    ({ params, db }) => {
                      return db.episode.findMany({
                        where: { movieId: params.id, id: params.episodeId },
                      });
                    },
                    { detail: { tags: ['title', 'episodes'] } }
                  )
              )
            )
        )
        .get(
          '/cast',
          ({ params, db }) => {
            return db.person.findMany({
              where: { movies: { some: { id: parseInt(params.id, 10) } } },
            });
          },
          { detail: { tags: ['title'] } }
        )
        .get(
          '/reviews',
          ({ params, db }) => {
            return db.review.findMany({
              where: { movieId: parseInt(params.id, 10) },
            });
          },
          { detail: { tags: ['title'] } }
        )
        .get(
          '/awards',
          ({ params, db }) => {
            return db.award.findMany({
              where: { movieId: parseInt(params.id, 10) },
            });
          },
          { detail: { tags: ['title'] } }
        );
    })
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
