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
  list: (topiclist) => {
    let list = '<ul>';
    topiclist.forEach((topic) => {
      list = list + `<li><a href="/?id=${topic.id}">${topic.title}</a></li>`;
    });
    list = list + '</ul>';
    console.log(list);
    return list;
  },
};
