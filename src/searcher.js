export class Searcher {
  query = '';

  constructor(query) {
    this.query = query;
  }

  getSuggestions(content) {
    console.log('Not implemented');
    return [];
  }

  get suggestionsURL() {
    console.log('Not implemented');
    return '';
  }

  get searchURL() {
    throw new Error('Not implemented');
  }
}
