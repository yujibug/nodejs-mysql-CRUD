const db = require('./db');
const template = require('./template');
const sanitizeHtml = require('sanitize-html');

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
