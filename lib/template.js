module.exports = {
  HTML: (title, list, body, control) => {
    return `
        <!doctype html>
        <html>
        <head>
          <title>WEB - ${title}</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1><a href="/">WEB</a></h1>
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
};
