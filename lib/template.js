const sanitizeHtml = require('sanitize-html');
const db = require('./db');
const { page } = require('./topic');

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
  list: (topics, countNum, PAGECONTENT, queryData) => {
    let pageNum = parseInt(countNum / PAGECONTENT);
    const pageReminder = countNum % PAGECONTENT;
    let idQuery = '';

    if (typeof queryData !== 'undefined') {
      idQuery = `&id=${queryData}`;
    }

    if (pageReminder >= 1) {
      pageNum += 1;
    }

    let list = '<ul>';
    topics.forEach((topic) => {
      list += `<li><a href="/?id=${topic.id}">${sanitizeHtml(
        topic.title
      )}</a></li>`;
    });
    list += '</ul>';

    for (let i = 1; i <= pageNum; i++) {
      list += `<p><div class="pageBox"><a class=pageBtn href="?page=${i}${idQuery}">${i}</a></div></p>`;
    }

    list +=
      '<form action="" method="POST"><p><select name="sortBy"><option value="title-asc">오름차순</option><option value="title-desc">내림차순</option><option value="id-desc">최신순</option><option value="id-asc">오래된순</option></select><input type="submit" value="정렬"></p></form > ';
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
