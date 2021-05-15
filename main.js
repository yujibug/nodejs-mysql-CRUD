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
let topiclist = [];

db.connect();

db.query('SELECT * FROM topic', function (error, topics) {
  if (error) {
    console.log(error);
  }
  for (i = 0; i < topics.length; i++) {
    let topic = {
      id: topics[i].id,
      title: topics[i].title,
    };

    topiclist.push(topic);
  }
});

const app = http.createServer((request, response) => {
  const _url = request.url;
  const myURL = new URL('http://localhost:3000' + _url);
  const queryData = myURL.searchParams.get('id');
  const pathname = myURL.pathname;

  if (pathname === '/') {
    if (queryData === null) {
      const list = template.list(topiclist);
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
        (error, topics) => {
          if (error) {
            throw error;
          }
          const title = topics[0].title;
          const description = topics[0].description;
          const list = template.list(topiclist);
          const html = template.HTML(
            title,
            list,
            `<h2>${title}</h2><p>${description}</p>`,
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
    fs.readdir('./data', (err, datalist) => {
      const title = 'WEB - create';
      const list = template.list(datalist);
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
    });
  } else if (pathname === '/create_process') {
    let body = '';
    request.on('data', (data) => {
      body = body + data;
    });
    request.on('end', () => {
      //인코딩된 쿼리스트링값 객체화
      console.log(body);
      const post = qs.parse(body);
      console.log(post);
      const title = post.title;
      const description = post.description;
      connection.query(
        `INSERT INTO topic(title, description) VALUES(${title}, ${description})`,
        function (error, results, fields) {
          if (error) {
            console.log(error);
          }
          response.writeHead(302, {
            Location: `/?id=${qs.escape(title)}`,
          });
          response.end();
        }
      );
    });
  } else if (pathname === '/update') {
    fs.readdir('./data', (err, datalist) => {
      const filteredId = path.parse(queryData).base;
      fs.readFile(`data/${filteredId}`, 'utf8', (err, description) => {
        //update시 쿼리스트링 id값에 존재하지 않는 data 삽입 -> 404
        if (description === undefined) {
          response.writeHead(404);
          response.end('Not Found');
          return;
        }
        const title = queryData;
        const list = template.list(datalist);
        const html = template.HTML(
          title,
          list,
          `
        <form action="/update_process" method="post">
        <input type="hidden" name="id" value="${title}">
        <p><input type="text" name="title" placeholder="title" value=${title}>
        </p>
        <p>
        <textarea name="description" placeholder="description">${description}</textarea>
        </p>
        <p>
        <input type="submit">
        </p>
        </form>
        `,
          `<a href="/create">create<a> <a href="/update?id=${title}">update<a>`
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
      console.log(body);
      const post = qs.parse(body);
      console.log(post);
      const title = post.title;
      const description = post.description;
      connection.query(
        `INSERT INTO topic(title, description) VALUES(${title}, ${description})`,
        function (error, results, fields) {
          if (error) {
            console.log(error);
          }
          response.writeHead(302, {
            Location: `/?id=${qs.escape(title)}`,
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
      const id = post.id;
      const filteredId = path.parse(id).base;
      fs.unlink(`./data/${filteredId}`, (err) => {
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
