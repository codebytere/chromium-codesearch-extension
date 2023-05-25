class ChromiumReviewSearcher extends Searcher {
  constructor(query) {
    super(query);
  }

  get suggestionsURL() {
    return `https://chromium-review.googlesource.com/changes/?q=status:open+-is:wip+${encodeURI(
      this.query,
    )}&n=5`;
  }

  getSuggestions(content) {
    if (content.startsWith(")]}'")) {
      content = content.slice(4);
    }

    const cls = JSON.parse(content);

    const suggestions = [];
    for (const cl of cls) {
      const { project, _number, subject } = cl;
      const url = `https://chromium-review.googlesource.com/c/${project}/+/${_number}`;
      console.log({ project, _number, subject });
      suggestions.push({
        content: url,
        description: `<match>${_number}</match>: ${subject}`,
      });
    }

    return suggestions;
  }

  get searchURL() {
    return this.suggestionsURL;
  }
}
