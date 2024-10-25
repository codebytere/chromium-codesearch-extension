
import {
  AuthorSearcher,
  CodesearchSearcher,
  ChromiumReviewSearcher,
  CrbugSearcher,
} from './searchers.js';

const CONFIG = [
  [['a', 'author'], AuthorSearcher, 'Commits by author'],
  [
    ['b', 'bug'],
    CrbugSearcher,
    'Your bugs or a bug ID, or project:bug ID (v8:898)',
    'search "commentby:me"',
  ],
  [['c', 'cs'], CodesearchSearcher, 'Chromium code', 'this is the default'],
  [['r', 'rev'], ChromiumReviewSearcher, 'Chromium revision'],
];

const commands = CONFIG.map((c) => describeKeywords(c[0]));

const describeKeywords = (keywords) =>
  keywords.map((kw) => `<url>${kw}:</url>`).join(' or ');

function getSearcher(query) {
  for (let i = 0; i < CONFIG.length; i++) {
    const keywords = CONFIG[i][0];
    for (let j = 0; j < keywords.length; j++) {
      const keyword = `${keywords[j]}:`;
      if (query.startsWith(keyword)) {
        return new CONFIG[i][1](query.slice(keyword.length).trim());
      }
    }
  }

  return new CodesearchSearcher(query);
}

chrome.omnibox.onInputChanged.addListener((query, suggest) => {
  if (query == '' || query.startsWith('?')) {
    suggest(
      CONFIG.map((it) => {
        let description = `${describeKeywords(it[0])} - <match>${
          it[2]
        }</match>`;
        if (it[3]) {
          description += `<dim>("${it[3]}")</dim>`;
        }
        return {
          content: it[0][0] + ': ',
          description,
        };
      })
    );
    return;
  }

  const searcher = getSearcher(query);
  if (!searcher.query) {
    suggest([]);
    return;
  }

  const runQuery = () => {
    fetch(searcher.suggestionsURL).then((result) => {
      result.text().then((text) => {
        suggest(searcher.getSuggestions(text));
      });
    });
  };

  runQuery();
});

chrome.omnibox.onInputEntered.addListener((query, disposition) => {
  if (!['http:', 'https:'].some((s) => query.startsWith(s))) {
    query = getSearcher(query).searchURL;
  }

  let tabsFunction = chrome.tabs.create;
  let tabsOptions = {
    active: true,
    url: query,
  };

  switch (disposition) {
    case 'currentTab':
      tabsFunction = chrome.tabs.update;
      break;
    case 'newBackgroundTab':
      tabsOptions.active = false;
      break;
    case 'newForegroundTab':
      break;
  }

  tabsFunction(tabsOptions);
});

chrome.omnibox.setDefaultSuggestion({
  description: 'Commands: <url>?</url>, ' + commands.join(', '),
});