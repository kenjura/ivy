const queryHelper = require('../util/queryHelper');
const _       = require('lodash');

module.exports.getForum = getForum;
module.exports.getForumIndex = getForumIndex;

function getForum(fid) {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM mybb_forums WHERE fid = '${fid}'`;
    queryHelper.execute(query)
      .then(data => resolve(data[0]))
      .catch(reject);
  });
}

function getForumIndex() {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM mybb_forums ORDER BY parentlist, disporder`;

    queryHelper.execute(query)
      .then(data => {
        const forums = data.map(forum => _.extend(forum, { depth:forum.parentlist.replace(/[^,]/g,'').length }));
        resolve(renderForums(forums));
      })
      .catch(reject);
  });
}

function getThreads() {
  const connection = mysql.createConnection({
    host: 'mysql2.cac1jwbdkdil.us-west-2.rds.amazonaws.com',
    user: 'dev',
    password: 'dev',
    database: 'dev'
  });

  connection.connect();

  const query = `SELECT p.*, f.name
  FROM mybb_posts p
  LEFT JOIN mybb_forums f ON f.fid = p.fid
  LIMIT 30`;

  console.log('sending query...');

  connection.query(query, (err, data, fields) => {
    if (err) die(err);
    const threaded = _.groupBy(data, 'tid');
    console.log(threaded);
    res.send(renderThreads(threaded));
  });

  connection.end();
};

function renderForums(forums) {
  return forums
    .map(forum => `<a class="forum" depth="${forum.depth}" href="/forum/${forum.fid}">${forum.name} <aside>(${forum.threads} threads, ${forum.posts} posts)</aside></a>`)
    .join('');
}

function renderThreads(threaded) {
  return `<html>
    <head>
      <style>
        body {
          background-color: #eee;
          font-family: sans-serif;
        }

        .thread {
          background-color: white;
          box-shadow: 0 0 5px 5px rgba(0,0,0,0.2);
          margin: 20px;
          padding: 20px;
        }

        .post {
          border-top: 2px solid #444;
          margin-top: 20px;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      ${_.values(threaded).map(thread => `<div class="thread">
        <h1>${thread[0].subject}</h1>
        ${thread.map(post => `<div class="post">
            <h3>${post.username} ${(new Date(post.dateline*1000)).toLocaleString()}</h3>
            <pre>${post.message}</pre>
          </div>`)}
      </div>`).join('')}
    </body>
  </html>`;
}