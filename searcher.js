class Searcher {
  query = ''

  constructor(query) {
    this.query = query
  }
  
  getSuggestions (content) {
    throw new Error('Not implemented');
  };

  get suggestionsURL () {
    throw new Error('Not implemented');
  };
  
  get searchURL () {
    throw new Error('Not implemented');
  };
  
  get shouldThrottle () {
    return false;
  }; 
}
