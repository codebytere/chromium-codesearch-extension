import { Searcher } from "./searcher.js";

export class AuthorSearcher extends Searcher {
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
          content: this.searchURL,
        });
      }
    }

    return suggestions;
  }

  get suggestionsURL() {
    return 'https://raw.githubusercontent.com/chromium/chromium/main/AUTHORS';
  }

  get searchURL() {
    const encoded = encodeURI(this.query);
    return `https://chromium.googlesource.com/chromium/src/+log/main?author=${encoded}`
  }
}


export class ChromiumReviewSearcher extends Searcher {
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

export class CrbugSearcher extends Searcher {
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

export class CodesearchSearcher extends Searcher {
  constructor(query) {
    super(query);
  }

  get searchURL() {
    return `https://source.chromium.org/search/?q=${encodeURI(
      this.query,
    )}&sq=package:chromium`;
  }
}
