const qs = require('querystring');

exports.sort = (request, func) => {
  let body = '';
  request.on('data', (data) => {
    body = body + data;
  });
  request.on('end', () => {
    const post = qs.parse(body);
    if (post.sortBy) {
      let sortBy = 'ORDER BY ' + post.sortBy.replace('-', ' ');
      func(sortBy);
    } else {
      func();
    }
  });
};
