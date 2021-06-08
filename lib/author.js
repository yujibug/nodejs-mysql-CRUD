const db = require('./db');
const template = require('./template');
const AUTHOR = 'author';
const qs = require('querystring');
const sanitizeHtml = require('sanitize-html');

exports.home = (request, response) => {
  db.query(`SELECT * FROM topic`, (error, topics) => {
    if (error) {
      throw error;
    }
    db.query(`SELECT * FROM author`, (error2, authors) => {
      if (error2) {
        throw error2;
      }

      const title = 'author';
      const list = template.list(topics);
      const html = template.HTML(
        title,
        list,
        `
        ${template.author_table(authors)}
        <style>
        table{
        border-collapse: collapse;
        }
        td{
        border:1px solid black;
        }
        </style>

        <form action="/author_create_process" method="post">
        <p>
        <input type="text" name="name" placeholder="name">
        </p>
        <p>
        <textarea name="profile" placeholder="profile"></textarea>
        </p>
        <p>
        <input type="submit" value="create">
        </p>
        </form>
        `,
        '',
        AUTHOR
      );
      response.writeHead(200);
      response.end(html);
    });
  });
};

exports.create_process = (request, response) => {
  let body = '';
  request.on('data', (data) => {
    body = body + data;
  });
  request.on('end', () => {
    const post = qs.parse(body);
    db.query(
      `INSERT INTO author(name, profile) 
        VALUES(?, ?)`,
      [post.name, post.profile],
      (error) => {
        if (error) {
          throw error;
        }
        response.writeHead(302, {
          Location: `/author`,
        });
        response.end();
      }
    );
  });
};

exports.update = (request, response) => {
  const _url = request.url;
  const myURL = new URL('http://localhost:3000' + _url);
  const queryData = myURL.searchParams.get('id');
  db.query(`SELECT * FROM topic`, (error, topics) => {
    if (error) {
      throw error;
    }
    db.query(`SELECT * FROM author`, (error2, authors) => {
      if (error2) {
        throw error2;
      }
      db.query(
        `SELECT * FROM author WHERE id = ?`,
        [queryData],
        (error3, authorTarget) => {
          if (error3) {
            throw error3;
          }
          const title = 'Author Update';
          const list = template.list(topics);
          const html = template.HTML(
            title,
            list,
            `
        ${template.author_table(authors)}
        <style>
        table{
        border-collapse: collapse;
        }
        td{
        border:1px solid black;
        }
        </style>

        <form action="/author_update_process" method="post">
        <input type="hidden" name="id" value="${authorTarget[0].id}">
        <p>
        <input type="text" name="name" placeholder="${sanitizeHtml(
          authorTarget[0].name
        )}">
        </p>
        <p>
        <textarea name="profile" placeholder="${sanitizeHtml(
          authorTarget[0].profile
        )}"></textarea>
        </p>
        <p>
        <input type="submit">
        </p>
        </form>
        `,
            '',
            AUTHOR
          );
          response.writeHead(200);
          response.end(html);
        }
      );
    });
  });
};

exports.update_process = (request, response) => {
  let body = '';
  request.on('data', (data) => {
    //요청에 data가 있으면 실행
    body += data;
  });
  request.on('end', () => {
    //요청에 data가 모두 받아졌으면 실행
    const post = qs.parse(body);
    db.query(
      'UPDATE author SET name = ?, profile = ? WHERE id = ?',
      [post.name, post.profile, post.id],
      (error) => {
        if (error) {
          throw error;
        }
        response.writeHead(302, {
          Location: '/author',
        });
        response.end();
      }
    );
  });
};

exports.delete_process = (request, response) => {
  let body = '';
  request.on('data', (data) => {
    //요청에 data가 있으면 실행
    body += data;
  });
  request.on('end', () => {
    const post = qs.parse(body);

    db.query('DELETE FROM author WHERE id = ?', [post.id], (error) => {
      if (error) {
        throw error;
      }
      response.writeHead(302, {
        Location: '/author',
      });
      response.end();
    });
  });
};
