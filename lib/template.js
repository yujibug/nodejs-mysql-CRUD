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
          <h1><a href="/">WEB</a></h1>
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
      list = list + `<li><a href="/?id=${topic.id}">${topic.title}</a></li>`;
    });
    list = list + '</ul>';
    return list;
  },
  author_tag: (authors, author_id) => {
    let author_tag = '';

    for (let i = 0; i < authors.length; i++) {
      let SELECTED = ``;
      if (author_id === authors[i].id) {
        SELECTED = ' selected';
      }
      author_tag += `<option value="${authors[i].id}"${SELECTED}>${authors[i].name}</option>`;
    }

    return `<select name="author">
    ${author_tag}
    </select>`;
  },
  author_table: (authors) => {
    let tag = `<table>`;
    for (let i = 0; i < authors.length; i++) {
      tag += `
        <tr>
        <td>${authors[i].name}</td>
        <td>${authors[i].profile}</td>
        <td><a href="/author_update?id=${authors[i].id}">update</a></td>
        <td><a href="/author_delete_process?id=${authors[i].id}">delete</a></td>
        </tr>
        `;
    }
    tag += `</table>`;
    return tag;
  },
};
