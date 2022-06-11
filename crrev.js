class CrrevSearcher extends Searcher {
  constructor(query) {
    super(query);
  }

  get suggestionsURL() {
    return `http://crrev.com/${encodeURI(this.query)}`;
  }

  getSuggestions (content) {
    const dom = new DOMParser().parseFromString(content, 'text/html');
  
    const { textContent: author } = dom.querySelector('tr:nth-child(2) td') ?? {};
    if (!author) return [];
  
    const { textContent: description } = dom.querySelector('tr:nth-child(5) td') ?? {};
    if (!description)  return [];
  
    description = description.split('\n')[0];
    if (description.length > 72) {
      description = description.slice(0, 71) + '\u2026';
    }
  
    return [{
      content: this.getSuggestionsURL(),
      description: [
        '<match>', description, '</match> ',
        '<dim>', author, '</dim>'
      ].join('')
    }];
  }

  get searchURL () {
    return this.getSuggestionsURL();
  }
}
