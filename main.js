const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const template = require('./lib/template.js');
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const mysql = require('mysql');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '940428',
  database: 'opentutorials',
});

db.connect();

// db.query('SELECT * FROM topic', function (error, topics) {
//   if (error) {
//     console.log(error);
//   }
//   for (i = 0; i < topics.length; i++) {
//     let topic = {
//       id: topics[i].id,
//       title: topics[i].title,
//     };

//     topiclist.push(topic);
//   }
// });

const app = http.createServer((request, response) => {
  const _url = request.url;
  const myURL = new URL('http://localhost:3000' + _url);
  const queryData = myURL.searchParams.get('id');
  const pathname = myURL.pathname;
  let test = [];
  function topiclist(callbackFunc) {
    db.query('SELECT * FROM topic', function (error, topics) {
      if (error) {
        throw error;
      }
      callbackFunc(topics);
    });
  }

  if (pathname === '/') {
    if (queryData === null) {
      //콜백함수를 통해 template.list 함수 파라미터로 topiclist 함수 리턴값 전달까지 성공했으나 변수에 넣으면 undefined 오류 발생
      topiclist((list) => {
        let testlist = template.list(list);
        return testlist;
      });

      // console.log(
      //   template.list(
      //     topiclist((list) => {
      //       return list;
      //     })
      //   )
      // );
      const title = 'Welcome!';
      const description = 'Hello, nodejs!';
      const html = template.HTML(
        title,
        list,
        `<h2>${title}</h2><p>${description}</p>`,
        '<a href="/create">create<a>'
      );
      response.writeHead(200);
      response.end(html);
    } else {
      db.query(
        `SELECT * FROM topic WHERE id=?`,
        [queryData],
        (error, topic) => {
          if (error) {
            throw error;
          }
          const list = template.list(topiclist);
          const html = template.HTML(
            topic[0].title,
            list,
            `<h2>${topic[0].title}</h2><p>${topic[0].description}</p>`,
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
    }
  } else if (pathname === '/create') {
    const title = 'Create';
    const list = template.list(topiclist);
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
        <input type="submit">
        </p>
        </form>
        `,
      ''
    );
    response.writeHead(200);
    response.end(html);
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
        [post.title, post.description, 1],
        function (error, result) {
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
    db.query(`SELECT * FROM topic WHERE id=?`, [queryData], (error, topic) => {
      if (error) {
        throw error;
      }
      const list = template.list(topiclist);
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
        <input type="submit">
        </p>
        </form>
        `,
        `<a href="/create">create<a> <a href="/update?id=${topic[0].id}">update<a>`
      );
      response.writeHead(200);
      response.end(html);
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
        `UPDATE topic SET title = ?, description = ? WHERE id = ${post.id}`,
        [post.title, post.description],
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
      db.query(
        'DELETE FROM topic WHERE id = ?',
        [post.id],
        function (error, result) {
          if (error) {
            throw error;
          }
          response.writeHead(302, {
            Location: '/',
          });
          response.end();
        }
      );
    });
  } else {
    response.writeHead(404);
    response.end('Not Found');
  }
});
app.listen(3000);
