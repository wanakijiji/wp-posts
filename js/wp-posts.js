
// 詳細ページ
$(function() {
	const url = location.href;
  const params = getParams();
	if (url.includes('post.html')) {
		const getUrl = (params.id && params.url) ? params.url + 'wp-json/wp/v2/posts/' + params.id + '/?_embed' : '';
		// 記事の取得
		$.get(getUrl, (post) => {
			const cateId = post.categories[0];
			$.get(params.url + 'wp-json/wp/v2/categories/' + cateId, (category) => {
				let target = $('article');
				post = fetchPost(post, category, params.url);
				insertHtml(target, post);
				// excerptに付くmore-linkを削除
				$('.wp-post .more-link').css('display', 'none');
			});
		});
	}
});

// 一覧ページ
$.fn.wpPosts = function(options) {
	$(this).css('display', 'none');
	const init = {
		url: 'https://blog.aroundit.net/',
		category: null,
		number: 10
	};
	options = Object.assign(init, options);
	let getUrl = (options.category) ? options.url + 'wp-json/wp/v2/posts/?_embed&per_page=' + options.number + '&filter=' + options.category : options.url + 'wp-json/wp/v2/posts/?_embed';
	// 記事の取得
	$.get(getUrl, (posts) => {
		let template = $(this).clone(true); // テンプレート
		let before = $(this); // ひとつ前の記事
		$.each(posts, (index, post) => {
			const cateId = post.categories[0];
			// カテゴリーの取得
			$.get(options.url + 'wp-json/wp/v2/categories/' + cateId, (category) => {
				let target = $(this);
				if (index !== 0) {
					target = template.clone(true);
					before.after(target);
					before = target;
				}
				post = fetchPost(post, category, options.url);
				insertHtml(target, post);
				// excerptに付くmore-linkを削除
				$('.wp-post .more-link').css('display', 'none');
			});
		});
	});
	return this;
};

// URLのパラメーターを取得
function getParams() {
  const params = {};
  const pair = location.search.substring(1).split('&');
  for(let i=0; pair[i]; i++) {
    const kv = pair[i].split('=');
    params[kv[0]]=kv[1];
  }
  return params;
}
// 取得情報を加工
function fetchPost(post, category, url) {
	return {
		category: category.name,
		title: post.title.rendered,
		content: post.content.rendered,
		excerpt: post.excerpt.rendered,
		date: (() => {
			const date = new Date(post.date);
			return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
		})(),
		link: 'post.html?url=' + url + '&id=' + post.id,
		id: post.id,
		image: (post['_embedded']['wp:featuredmedia']) ? post['_embedded']['wp:featuredmedia'][0].source_url : null
	};
}
// タグに挿入
function insertHtml(target, post) {
	$.each(post, (key, value) => {
		if (key === 'link') {
			// link
			target.find('[data-' + key + ']').attr('href', value);
		} else if (key === 'image') {
			// image
			target.find('[data-' + key + ']').attr('src', value);
		} else {
			// title, content, excerpt
			target.find('[data-' + key + ']').html(value);
		}
		target.css('display', 'block');
	});
}
