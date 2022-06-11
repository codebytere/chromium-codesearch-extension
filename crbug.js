class CrbugSearcher extends Searcher {
  mainProject = 'chromium'
  projects = ['chromium', 'v8', 'skia', 'webrtc', 'pdfium', 'angleproject']

  constructor(query) {
    super(query);
  }

  get suggestionsURL () {
    return this.#isBugQuery() ? this.#getBugURL() : this.#getIssueListURL();
  }

  getSuggestions (response) {
    const dom = new DOMParser().parseFromString(response, 'text/html');
  
    if (this.#isBugQuery()) {
      const { textContent: summary } = dom.querySelector('#issueheader span.h3');
      if (!summary) return [];

      const { textContent: owner } = dom.querySelector('#issuemeta tr:nth-child(2) a.userlink');

      return [{
        content: this.getBugURL_(),
        description: this.#getBugDescription(summary, owner ?? '--', this.query)
      }];
    }
  
    const suggestions = [];
    const results = dom.querySelectorAll('#resultstable tr:not(#headingrow)');
    for (const row in results) {
      const { textContent: id } = row.getElementsByClassName('col_0')[0] ?? {};
      if (!idElem) return;
  
      const { textContent: owner } = row.getElementsByClassName('col_7')[0] ?? {};
      if (!owner) return;
  
      const { textContent: summary } = row.getElementsByClassName('col_8')[1] ?? {};
      if (!summary) return;
  
      suggestions.push({
        content: this.#getCodeGoogleComIssue(id),
        description: this.#getBugDescription(summary, owner, id)
      });
    }

    return suggestions;
  };

  get shouldThrottle () {
    return true;
  };

  get searchURL () {
    return this.#isBugQuery() ? this.#getBugURL() : this.#getIssueListURL();
  };

  #isBugQuery () {
    return !!this.#parseBugNumberQuery(this.query);
  };

  #getBugURL () {
    return this.#getCodeGoogleComIssue(this.query);
  };

  #getBugDescription (summary, owner, id) {
    const description = owner ? `<dim>${owner}</dim>` : `<match>${summary}</match>`;
    return `${description}<url>crbug.com/${id}</url>`;
  }

  #parseBugNumberQuery (originalQuery) {
    let query, parsedQuery, project = this.mainProject;
    const isBug = (q) => !isNaN(Number.parseInt(q));
  
    query = originalQuery;
    if (isBug(query)) {
      return { project: project, issueNumber: query };
    }
  
    parsedQuery = originalQuery.split(":");
    project = parsedQuery[0];
    query = parsedQuery[1];
  
    if (this.projects.contains(project) && isBug(query)) {
      return { project: project, issueNumber: query };
    }
  
    return {};
  }
  
  #getCodeGoogleComIssue (query) {
    const { project, issueNumber } = this.#parseBugNumberQuery(query);
    return `https://bugs.chromium.org/p/${project}/issues/detail?id=${issueNumber}`;
  };
  
  #getIssueListURL () {
    // The query separates spaces with +, but encodes each component.
    const encodedQuery = [];
    this.query.split(' ').forEach(function(component) {
      encodedQuery.push(encodeURI(component));
    });
    return [
      'https://bugs.chromium.org/p/' + this.mainProject + '/issues/list?',
      'q=commentby:me+', encodedQuery.join('+'), '&',
      'sort=-id&',
      'colspec=ID%20Pri%20M%20Iteration%20ReleaseBlock%20Cr%20Status%20Owner%20',
      'Summary%20OS%20Modified'
    ].join('');
  }
}
