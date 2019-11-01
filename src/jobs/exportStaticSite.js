require('dotenv').config({ path:'/etc/ivy.env' });

const debug = require('debug')('ivy:exportStaticSite');
const fs = require('fs');
const path = require('path');
const sanitize = require("sanitize-filename");

const { deleteDirectory } = require('../util/rimraf.js');
const { getForums } = require('../controllers/forumCtrl');
const { getAllThreads, getPosts } = require('../controllers/postCtrl');
const { listToTree } = require('../util/listToTree');
const { promisify } = require('util');

const mkdir = promisify(fs.mkdir);
const rmdir = promisify(fs.rmdir);
const writeFile = promisify(fs.writeFile);

main();

async function main() {
	debug('starting export...');

	const outputFolder = path.resolve(process.cwd(), 'build');
	await deleteDirectory(outputFolder);
	await mkdir(outputFolder);

	const forumsVerbose = await getForums();
	const forums = forumsVerbose.map(({ name, depth, fid, pid, parentlist }) => ({ name, depth, fid, pid, parentlist }));
	const forumMap = mapFromArray(forums, 'fid');
	forums.forEach(f => {
		if (f.parentlist && f.parentlist.length)
			f.path = f.parentlist.split(',').map(id => forumMap[id].name).map(path => sanitize(path)).join('/');
	});
	debug('making folders...');
	let folderCount = 0;
	await Promise.all(forums
		.sort((a,b) => a.depth - b.depth)
		.map(forum => {
			debug(`writing folder: ${forum.path}`);
			folderCount++;
			return mkdir(path.resolve(outputFolder, forum.path));
		})
	);
	debug(`created ${folderCount} folders`);

	debug(`getting threads...`);
	const threads = await getAllThreads();
	debug(`got ${threads.length} threads.`);
	threads.forEach((thread, key) => {
		thread.markdown = threadToMarkdown(thread);
		thread.forum = forumMap[thread.fid];
		thread.filename = `${thread.tid} - ${sanitize(thread.subject)}.md`;
		thread.path = path.resolve(outputFolder, thread.forum.path, thread.filename);
	});
	debug(`threads now have markdown and forums attached`);
	await Promise.all(threads.map(thread => {
		try {
			debug(`writing file: ${thread.path}`);
			return writeFile(thread.path, thread.markdown);
		} catch(err) {
			console.err(`Error with thread ${thread.fid}_${thread.pid}_${thread.subject}`, err);
		}
	}));
	debug(`all threads written to disk`);
		// await fs.writeFile(path.resolve(outputFolder, 'foo.md'), 'this is foo');


	debug('done!');
}

function threadToMarkdown(thread) {
	// console.log('thread=', `${thread.tid}_${thread.fid}_${thread.posts.length}`);
	return thread.posts.map(formatPost).join('\n-----------------------\n');
}

function formatPost(post) {
	const { subject, message, dateline, username } = post;

	return `
# ${subject}
${username}, ${(new Date(dateline*1000)).toLocaleString()}
${message}
	`;
}

function mapFromArray(arr, field) {
	const map = {};
	for (let i = 0; i < arr.length; i++) {
		map[arr[i][field]] = arr[i];
	}
	return map;
}