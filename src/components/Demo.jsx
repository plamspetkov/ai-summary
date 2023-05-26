import { useState, useEffect } from 'react';

import { copy, linkIcon, loader, tick, submit, deleteIcon } from '../assets';
import { useLazyGetSummaryQuery } from '../store/article';

const Demo = () => {
	const [article, setArticle] = useState({
		url: '',
		summary: '',
	});

	const [allArticles, setAllArticles] = useState([]);

	const [copied, setCopied] = useState('');

	const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

	useEffect(() => {
		const articlesFromLocalStorage = JSON.parse(
			localStorage.getItem('articles')
		);

		if (articlesFromLocalStorage) {
			setAllArticles(articlesFromLocalStorage);
		}
	}, []);

	const submitHandler = async (e) => {
		e.preventDefault();
		const { data } = await getSummary({ articleUrl: article.url });

		if (data?.summary) {
			const newArticle = {
				...article,
				summary: data.summary,
			};

			const updateAllArticles = [newArticle, ...allArticles];

			setArticle(newArticle);
			setAllArticles(updateAllArticles);

			localStorage.setItem('articles', JSON.stringify(updateAllArticles));
		}
	};

	const copyHandler = (copyUrl) => {
		setCopied(copyUrl);
		navigator.clipboard.writeText(copyUrl);

		setTimeout(() => {
			setCopied(false);
		}, 3000);
	};

	const deleteHandler = (deleteUrl) => {
		const updateAllArticles = JSON.parse(localStorage.getItem('articles'));
		const deleteArticle = updateAllArticles.findIndex(
			(article) => article.url === deleteUrl
		);

		if (deleteArticle !== -1) {
			updateAllArticles.splice(deleteArticle, 1);
			setAllArticles(updateAllArticles);
			localStorage.setItem('articles', JSON.stringify(updateAllArticles));
		}
		if (updateAllArticles.length === 0) {
			localStorage.removeItem('articles');
		}
	};

	return (
		<section className="mt-16 w-full max-w-xl">
			<div className="flex flex-col w-full gap-2">
				<form
					className="relative flex justify-center items-center"
					onSubmit={submitHandler}
				>
					<img
						src={linkIcon}
						alt="link icon"
						className="absolute left-0 my-2 ml-3 w-5"
					/>

					<input
						type="url"
						placeholder="Enter a URL"
						value={article.url}
						onChange={(e) => {
							setArticle({ ...article, url: e.target.value });
						}}
						required
						className="url_input peer"
					/>

					<button
						type="submit"
						className="submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700"
					>
						<img src={submit} alt="submit" className="w-3 h-3 object-contain" />
					</button>
				</form>

				{/* {Browse URL History} */}

				<div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
					{allArticles.map((item, index) => (
						<div
							key={`link-${index}`}
							onClick={() => setArticle(item)}
							className="link_card"
						>
							<div className="copy_btn" onClick={() => copyHandler(item.url)}>
								<img
									src={copied === item.url ? tick : copy}
									alt="copy icon"
									className="w-[60%] h-[60%] object-contain"
								/>
							</div>
							<p className="flex font-satoshi text-blue-700 font-medium w-full text-sm truncate">
								{item.url}
							</p>
							<div className="copy_btn" onClick={() => deleteHandler(item.url)}>
								<img
									src={deleteIcon}
									alt="delete"
									className="w-[100%] h-[50%] "
								/>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* {Display Results} */}

			<div className="my-10 max-w-full flex justify-center items-start">
				{isFetching ? (
					<img src={loader} alt="loader" className="w-20 h-20 object-contain" />
				) : error ? (
					<p className="font-inter font-bold text-black text-center">
						Well, that wasn't supposed to happen...
						<br />{' '}
						<span className="font-satoshi font-normal text-gray-700">
							{error?.data?.error}
						</span>
					</p>
				) : (
					article.summary && (
						<div className="flex flex-col gap-3">
							<h2 className="font-satoshi font-bold text-gray-600 text-xl">
								Article <span className="blue_gradient">Summary</span>
							</h2>
							<div className="summary_box">
								<p className="font-inter font-medium text-sm text-gray-700">
									{article?.summary}
								</p>
							</div>
						</div>
					)
				)}
			</div>
		</section>
	);
};

export default Demo;
