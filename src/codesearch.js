class CodesearchSearcher extends Searcher {
  constructor(query) {
    super(query);
  }

  get searchURL() {
    return `https://source.chromium.org/search/?q=${encodeURI(
      this.query,
    )}&sq=package:chromium&type=cs`;
  }
}
