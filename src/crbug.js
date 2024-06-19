class CrbugSearcher extends Searcher {
  constructor(query) {
    super(query);
  }

  get searchURL() {
    const isBug = (q) => !isNaN(Number.parseInt(q));

    const bugURL = `https://issues.chromium.org/issues/${this.query}`
    const encoded = this.query.split(' ').join('+');
    const issueListURL = `https://issues.chromium.org/issues?q=${encodeURI(encoded)}`;

    return isBug(this.query) ? bugURL : issueListURL;
  }
}
