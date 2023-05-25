class CrbugSearcher extends Searcher {
  constructor(query) {
    super(query);
  }

  get searchURL() {
    const bugQuery = this.parseBugNumberQuery();

    const bugURL = `https://bugs.chromium.org/p/${bugQuery.project}/issues/detail?id=${bugQuery.issueNumber}`;

    return bugQuery ? bugURL : this.getIssueListURL();
  }

  parseBugNumberQuery() {
    const isBug = (q) => !isNaN(Number.parseInt(q));

    if (isBug(this.query)) {
      return { project: 'chromium', issueNumber: this.query };
    }

    const [project, parsedQuery] = this.query.split(':');

    return isBug(parsedQuery) ? { project: project, issueNumber: parsedQuery } : false;
  }

  getIssueListURL() {
    const encoded = this.query.split(' ').join('+');
    return `https://bugs.chromium.org/p/chromium/issues/list?q=${encodeURI(encoded)}`;
  }
}
