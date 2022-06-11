class AuthorSearcher extends Searcher {
  constructor(query) {
    super(query);
  }

  getSuggestions (content) {
    const startLine = "# BEGIN individuals section.";
    const endLine = '# Please DO NOT APPEND here. See comments at the top of the file.\n# END individuals section.'
    const start = content.indexOf(startLine);
    const end = content.indexOf(endLine);

    const sliced = content.slice(start + startLine.length, end).trim();
    const members = sliced.split('\n');
    if (!members.length) return [];
  
    const suggestions = [];
    for (const member of members) {
      const idx = member.indexOf(this.query);
      const email = member.slice(member.indexOf('<') + 1).split('@')[0];
      if (idx !== -1) {
        suggestions.push({
          description: `${member.replace('<', '').replace('>', '')}`,
          content: email,
        });
      }
    }

    return suggestions;
  };

  get suggestionsURL () {
    return 'https://raw.githubusercontent.com/chromium/chromium/main/AUTHORS';
  };

  get searchURL () {
    return this.#getGitChromiumOrgAuthorSearch(this.query);
  };
  
  #getGitChromiumOrgAuthorSearch (author) {
    return `https://chromium.googlesource.com/chromium/src/+log/main?author=${encodeURI(author)}`;
  };
}
