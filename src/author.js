class AuthorSearcher extends Searcher {
  constructor(query) {
    super(query);
  }

  getSuggestions(content) {
    const startLine = '# BEGIN individuals section.';
    const endLine =
      '# Please DO NOT APPEND here. See comments at the top of the file.\n# END individuals section.';
    const start = content.indexOf(startLine);
    const end = content.indexOf(endLine);

    const sliced = content.slice(start + startLine.length, end).trim();
    const members = sliced.split('\n');
    if (!members.length) return [];

    const suggestions = [];
    for (const member of members) {
      const [name, email] = member.split('<').map((m) => {
        return m.replace('<', '').replace('>', '').trim();
      });

      if (member.indexOf(this.query) !== -1) {
        suggestions.push({
          description: `<match>${name}</match> <dim>${email}</dim>`,
          content: this.getGitChromiumOrgAuthorSearch(this.query),
        });
      }
    }

    return suggestions;
  }

  get suggestionsURL() {
    return 'https://raw.githubusercontent.com/chromium/chromium/main/AUTHORS';
  }

  get searchURL() {
    return this.getGitChromiumOrgAuthorSearch(this.query);
  }

  getGitChromiumOrgAuthorSearch(author) {
    return `https://chromium.googlesource.com/chromium/src/+log/main?author=${encodeURI(author)}`;
  }
}
