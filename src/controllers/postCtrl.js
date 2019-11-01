const bbParser     = require('../util/bbParser');
const queryHelper  = require('../util/queryHelper');
const _            = require('lodash');
const wikiParser   = require('../util/wikiParser');

module.exports = { getAllThreads, getThread, getPosts, getPostIndex };

function getPostIndex(fid) {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM mybb_posts WHERE fid = '${fid}' AND replyto = 0 ORDER BY dateline DESC`;
    queryHelper.execute(query)
      .then(data => resolve(renderPostIndex(data, fid)))
      .catch(reject);
  });
}

async function getPosts({ fid, tid }={}) {
  const where = (fid || tid) ? `WHERE ${fid ? `fid = '${fid.replace(/'/,'')}'` : ''} ${tid ? `tid = '${tid.replace(/'/,'')}'` : ''}` : '';
  const query = `SELECT * FROM mybb_posts ${where}`;
  const data = await queryHelper.execute(query);
  return data;
}

async function getAllThreads() {
  const query = `SELECT * FROM mybb_posts`;
  const posts = await queryHelper.execute(query);
  const grouped = posts.reduce((arr, post) => {
    const { tid, fid, subject } = post;
    let el = arr.find(e => e.fid === fid && e.tid === tid);
    if (!el) {
      arr.push({ fid, tid, subject, posts:[] });
      el = arr[arr.length-1];
    }
    el.posts.push(post);
    return arr;
  }, []);
  return grouped;
}

function getThread(fid, tid) {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM mybb_posts WHERE fid = '${fid}' AND tid = '${tid}' ORDER BY dateline`;
    queryHelper.execute(query)
      .then(data => resolve({
        body: renderThread(data, fid),
        root: data[0]
      }))
      .catch(reject);
  });
}


function renderPostIndex(posts, fid) {
  return posts.map(post => `<a class="post" href="/forum/${fid}/thread/${post.tid}">
    <span class="post-title">${post.subject}</span>
    <aside>
      <span class="post-author" href="#">${post.username}</span>
      <span class="post-time" href="#">${(new Date(post.dateline*1000)).toLocaleString()}</span>
    </aside>
  </a>`).join('');
}

function renderThread(posts, fid, tid) {
  return `<div class="thread">
    ${posts.map(post => `<div class="post">
        <div class="headline">
          ${post.username} ${(new Date(post.dateline*1000)).toLocaleString()}
        </div>
        <div class="message">
          ${bbParser.parse(wikiParser.parse(post.message))}
        </div>
    </div>`).join('')}
  </div>`;
}