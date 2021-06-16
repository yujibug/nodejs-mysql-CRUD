const db = require('./db');
const template = require('./template');
const qs = require('querystring');
const sanitizeHtml = require('sanitize-html');

exports.home = (request, response) => {
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
};

exports.page = (request, response) => {
  const _url = request.url;
  const myURL = new URL('http://localhost:3000' + _url);
  const order = myURL.searchParams.get('order');
  const queryData = myURL.searchParams.get('id');

  function orderby() {
    if (order === 'asc') {
      db.query('SELECT * FROM topic ORDER BY title ASC', (error, topics) => {
        return template.list(topics);
      });
    } else {
      db.query('SELECT * FROM topic', (error, topics) => {
        return template.list(topics);
      });
    }
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
      const list = orderby();
      const html = template.HTML(
        topic[0].title,
        list,
        `<h2>${sanitizeHtml(title)}</h2>
              <p>${sanitizeHtml(description)}</p>
              <p>by ${sanitizeHtml(author)}</p>
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
};

exports.create = (request, response) => {
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
};

exports.create_process = (request, response) => {
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
          if (error.errno === 1062) {
            // alert('title은 중복되면 안됩니다!');
            throw 'stop';
          }
          throw error;
        }
        response.writeHead(302, {
          Location: `/?id=${qs.escape(result.insertId)}`,
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
    db.query(`SELECT * FROM topic WHERE id=?`, [queryData], (error2, topic) => {
      if (error) {
        throw error2;
      }
      db.query(`SELECT * FROM author`, (error2, authors) => {
        const list = template.list(topics);
        const tag = template.author_tag(authors, topic[0].author_id);
        const html = template.HTML(
          sanitizeHtml(topic[0].title),
          list,
          // id는 hidden 속성으로 사용자가 입력할 수 없음
          `
        <form action="/update_process" method="post">
        <input type="hidden" name="id" value="${topic[0].id}">
        <p><input type="text" name="title" placeholder="title" value=${sanitizeHtml(
          topic[0].title
        )}>
        </p>
        <p>
        <textarea name="description" placeholder="description">${sanitizeHtml(
          topic[0].description
        )}</textarea>
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
    });
  });
};

exports.update_process = (request, response) => {
  let body = '';
  request.on('data', (data) => {
    body = body + data;
  });
  request.on('end', () => {
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
};

exports.delete_process = (request, response) => {
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
};

exports.list = (request, response) => {
  const _url = request.url;
  const myURL = new URL('http://localhost:3000' + _url);
  const keyword = myURL.searchParams.get('keyword');

  db.query(
    `SELECT * FROM topic WHERE title LIKE '%${sanitizeHtml(keyword)}%'`,
    (error, topics) => {
      if (error) {
        throw error;
      }

      const title = 'SEARCH';
      const list = template.list(topics);
      const html = template.HTML(title, list, '', '');

      response.writeHead(200);
      response.end(html);
    }
  );
};
