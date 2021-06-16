const sanitizeHtml = require('sanitize-html');

module.exports = {
  HTML: (title, list, body, control, authorControl) => {
    let authorBtn;
    if (authorControl === 'author') {
      authorBtn = '';
    } else {
      authorBtn = `<a href='/author'>author</a>`;
    }
    return `
        <!doctype html>
        <html>
        <head>
          <title>WEB - ${title}</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1>
            <a href="/">WEB</a>
          </h1>
          <form action="search" method="GET">
            <p>
              <input type="text" name="keyword" />
            </p>
          </form>
          ${authorBtn}
          ${list}
          ${control}
          ${body}
        </body>
        </html>
        `;
  },
  list: (topics) => {
    let list = '<ul>';
    topics.forEach((topic) => {
      list =
        list +
        `<li><a href="/?id=${topic.id}">${sanitizeHtml(topic.title)}</a></li>`;
    });
    list =
      list +
      '</ul><form action="" method="GET"><input type="hidden" name="order" value="asc" /><p><input type="submit" value="오름차순"/></p></form>';
    return list;
  },
  author_tag: (authors, author_id) => {
    let author_tag = '';

    authors.forEach((author) => {
      let SELECTED = ``;
      if (author_id === author.id) {
        SELECTED = ' selected';
      }
      author_tag += `<option value="${author.id}"${SELECTED}>${sanitizeHtml(
        author.name
      )}</option>`;
    });

    return `<select name="author">
    ${author_tag}
    </select>`;
  },
  author_table: (authors) => {
    let tag = `<table>`;

    authors.forEach((author) => {
      tag += `
        <tr>
        <td>${sanitizeHtml(author.name)}</td>
        <td>${sanitizeHtml(author.profile)}</td>
        <td><a href="/author_update?id=${author.id}">update</a></td>
        <td>
        <form action="author_delete_process" method="post">
          <input type="hidden" name='id' value="${author.id}">
          <input type="submit" value="delete">
        </form>
        </td>
        </tr>
        `;
    });

    tag += `</table>`;
    return tag;
  },
};
