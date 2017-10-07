module.exports.parse = parse;

function parse(str) {
	let html = str;

	// inline
	html = html.replace(/\[b\]/g, '<b>');
	html = html.replace(/\[\/b\]/g, '</b>');
	html = html.replace(/\[i\]/g, '<i>');
	html = html.replace(/\[\/i\]/g, '</i>');
	html = html.replace(/\[size=large\]/g, '<large>');
	html = html.replace(/\[\/size\]/g, '</large>');

	// links
	html = html.replace(/\[url=([^\]]+)\]/g, '<a href="$1">');
	html = html.replace(/\[\/url\]/g, '</a>');

	// ul/li
	html = html.replace(/\[list\]/g, '<ul>');
	html = html.replace(/\[\*\](.*)/g, '<li>$1</li>');
	html = html.replace(/\[\/list\]/g, '</ul>');

	return html;
}