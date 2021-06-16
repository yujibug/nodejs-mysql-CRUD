const http = require('http');
const topic = require('./lib/topic');
const author = require('./lib/author');
const search = require('./lib/search');

const app = http.createServer((request, response) => {
  const _url = request.url;
  const myURL = new URL('http://localhost:3000' + _url);
  const queryData = myURL.searchParams.get('id');
  const pathname = myURL.pathname;

  if (pathname === '/') {
    if (queryData === null) {
      topic.home(request, response);
    } else {
      topic.page(request, response);
    }
  } else if (pathname === '/create') {
    topic.create(request, response);
  } else if (pathname === '/create_process') {
    topic.create_process(request, response);
  } else if (pathname === '/update') {
    topic.update(request, response);
  } else if (pathname === '/update_process') {
    topic.update_process(request, response);
  } else if (pathname === '/delete_process') {
    topic.delete_process(request, response);
  } else if (pathname === '/author') {
    author.home(request, response);
  } else if (pathname === '/author_create_process') {
    author.create_process(request, response);
  } else if (pathname === '/author_update') {
    author.update(request, response);
  } else if (pathname === '/author_update_process') {
    author.update_process(request, response);
  } else if (pathname === '/author_delete_process') {
    author.delete_process(request, response);
  } else if (pathname === '/search') {
    search.list(request, response);
  } else {
    response.writeHead(404);
    response.end('Not Found');
  }
});
app.listen(3000);
