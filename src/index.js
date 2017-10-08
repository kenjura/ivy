require('dotenv').config({ path:'/etc/ivy.env' });

const chalk        = require('chalk');
const express      = require('express');
const forumCtrl    = require('./controllers/forumCtrl');
const htmlRenderer = require('./util/htmlRenderer');
const logger       = require('morgan');
const path         = require('path');
const postCtrl    = require('./controllers/postCtrl');

console.log('__dirname=',__dirname);

const app = express();

app.set('port', process.env.PORT);
app.set('views', './src/views');
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.engine('html', htmlRenderer);


app.get('/', function(req,res){
  forumCtrl.getForumIndex()
    .then(forums => res.render('index',{ body:forums, siteTitle:'Ivy: forum index', title:'Forum index' }))
    .catch(error => res.render('index',{ body:error, siteTitle:'Ivy: error', title:'There was a bear' }));
})

app.get('/forum/:fid', (req, res) => {
  Promise.all([ forumCtrl.getForum(req.params.fid), postCtrl.getPostIndex(req.params.fid) ])
    .then(data => {
      const forum = data[0];
      const postIndex = data[1];
      res.render('index',{
        body: postIndex,
        breadcrumbs: `<a href="/forum/${req.params.fid}">${forum.name} index</a>`,
        title: forum.name,
        siteTitle: `Ivy: ${forum.name} index`
      });
    })
});

app.get('/forum/:fid/thread/:tid', (req, res) => {
  Promise.all([ forumCtrl.getForum(req.params.fid), postCtrl.getThread(req.params.fid, req.params.tid) ])
    .then(data => {
      const forum = data[0];
      const thread = data[1];
      res.render('index', {
        body: thread.body,
        breadcrumbs: `<a href="/forum/${req.params.fid}">${forum.name}</a>
          <a href="/forum/${req.params.fid}/thread/${req.params.tid}">${thread.root.subject}</a>`,
        title: thread.root.subject,
        siteTitle: `Ivy: thread #${req.params.tid}`
      });
    })
    .catch(error => res.render('index', { body:error, title:'error' }));
});


app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env')); 
  console.log('  Press CTRL-C to stop\n');
});