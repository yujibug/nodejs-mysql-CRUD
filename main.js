const http = require('http');
const qs = require('querystring');
const template = require('./lib/template.js');
const db = require('./lib/db');

const app = http.createServer((request, response) => {
  const _url = request.url;
  const myURL = new URL('http://localhost:3000' + _url);
  const queryData = myURL.searchParams.get('id');
  const pathname = myURL.pathname;

  if (pathname === '/') {
    if (queryData === null) {
      db.query(`SELECT * FROM topic`, (error, topics) => {
        if (error) {
          throw error;
        }
        const title = 'Welcome!';
        const description = 'Hello, nodejs!';
        const list = template.list(topics);
        const html = template.HTML(
          title,
          list,
          `<h2>${title}</h2><p>${description}</p>`,
          '<a href="/create">create<a>'
        );
        response.writeHead(200);
        response.end(html);
      });
    } else {
      db.query(`SELECT * FROM topic`, (error, topics) => {
        if (error) {
          throw error;
        }
        db.query(
          `SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE topic.id=?`,
          [queryData],
          (error2, topic) => {
            if (error2) {
              throw error2;
            }
            const title = topic[0].title;
            const description = topic[0].description;
            const author = topic[0].name;
            const list = template.list(topics);
            const html = template.HTML(
              topic[0].title,
              list,
              `<h2>${title}</h2>
              <p>${description}</p>
              <p>by ${author}</p>
              `,
              `<a href="/create">create<a>
            <a href="/update?id=${queryData}">update<a>
            <form action="delete_process" method="post">
            <input type="hidden" name='id' value="${queryData}">
            <input type="submit" value="delete">
            </form>`
            );
            response.writeHead(200);
            response.end(html);
          }
        );
      });
    }
  } else if (pathname === '/create') {
    db.query(`SELECT * FROM topic`, (error, topics) => {
      db.query(`SELECT * FROM author`, (error2, authors) => {
        const title = 'Create';
        const list = template.list(topics);
        const tag = template.author_tag(authors);
        const html = template.HTML(
          title,
          list,
          `
        <form action="/create_process" method="post">
        <p>
        <input type="text" name="title" placeholder="title">
        </p>
        <p>
        <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
        ${tag}
        </p>
        <p>
        <input type="submit">
        </p>
        </form>
        `,
          ''
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if (pathname === '/create_process') {
    let body = '';
    request.on('data', (data) => {
      body = body + data;
    });
    request.on('end', () => {
      //인코딩된 쿼리스트링값 객체화
      const post = qs.parse(body);
      db.query(
        `INSERT INTO topic(title, description, created, author_id) 
        VALUES(?, ?, NOW(), ?)`,
        [post.title, post.description, post.author],
        (error, result) => {
          if (error) {
            throw error;
          }
          response.writeHead(302, {
            Location: `/?id=${qs.escape(result.insertId)}`,
          });
          response.end();
        }
      );
    });
  } else if (pathname === '/update') {
    db.query(`SELECT * FROM topic`, (error, topics) => {
      if (error) {
        throw error;
      }
      db.query(
        `SELECT * FROM topic WHERE id=?`,
        [queryData],
        (error2, topic) => {
          if (error) {
            throw error2;
          }
          db.query(`SELECT * FROM author`, (error2, authors) => {
            const list = template.list(topics);
            const tag = template.author_tag(authors, topic[0].author_id);
            const html = template.HTML(
              topic[0].title,
              list,
              `
        <form action="/update_process" method="post">
        <input type="hidden" name="id" value="${topic[0].id}">
        <p><input type="text" name="title" placeholder="title" value=${topic[0].title}>
        </p>
        <p>
        <textarea name="description" placeholder="description">${topic[0].description}</textarea>
        </p>
        <p>
        ${tag}
        </p>
        <p>
        <input type="submit">
        </p>
        </form>
        `,
              `<a href="/create">create<a> <a href="/update?id=${topic[0].id}">update<a>`
            );
            response.writeHead(200);
            response.end(html);
          });
        }
      );
    });
  } else if (pathname === '/update_process') {
    let body = '';
    request.on('data', (data) => {
      body = body + data;
    });
    request.on('end', () => {
      //인코딩된 쿼리스트링값 객체화
      const post = qs.parse(body);
      db.query(
        'UPDATE topic SET title = ?, description = ?, author_id = ? WHERE id = ?',
        [post.title, post.description, post.author, post.id],
        function (error) {
          if (error) {
            throw error;
          }
          response.writeHead(302, {
            Location: `/?id=${qs.escape(post.id)}`,
          });
          response.end();
        }
      );
    });
  } else if (pathname === '/delete_process') {
    let body = '';
    request.on('data', (data) => {
      body = body + data;
    });
    request.on('end', () => {
      const post = qs.parse(body);
      db.query('DELETE FROM topic WHERE id = ?', [post.id], (error) => {
        if (error) {
          throw error;
        }
        response.writeHead(302, {
          Location: '/',
        });
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end('Not Found');
  }
});
app.listen(3000);
