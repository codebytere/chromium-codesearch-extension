class CodesearchSearcher extends Searcher {
  constructor(query) {
    super(query);
  }

  getSuggestions(content) {
    let suggestions;
    try {
      const json = JSON.parse(content);
      suggestions = json.suggest_response[0].suggestion;
      if (!suggestions) return [];
    } catch (e) {
      console.error(e);
      return [];
    }

    suggestions.sort((s1, s2) => s1.score < s2.score);

    window.cs = suggestions
      .map((suggest) => {
        const hasLine = suggest?.goto_line > 1;
        const { goto_package_id, goto_line, goto_path } = suggest;
        const href = `https://cs.chromium.org/${goto_package_id}/${goto_path}?q=${encodeURI(
          this.query
        )}&sq=package:chromium&${hasLine ? `l=${goto_line}` : ""}`;

        if (!("match_start" in suggest)) suggest.match_start = 0;
        if (!("match_end" in suggest)) suggest.match_end = suggest.title.length;

        return {
          content: href,
          description: [
            suggest.title.slice(0, suggest.match_start),
            "<match>",
            suggest.title.slice(suggest.match_start, suggest.match_end),
            "</match>",
            suggest.title.slice(suggest.match_end),
            " <url>",
            suggest.goto_path,
            hasLine ? ":" + suggest.goto_line : "",
            "</url>",
          ].join(""),
        };
      })
      .bind(this);

    return window.cs;
  }

  get searchURL() {
    return `https://cs.chromium.org/search/?q=${encodeURI(
      this.query
    )}&sq=package:chromium&type=cs`;
  }

  get suggestionsURL() {
    return [
      "https://cs.chromium.org/codesearch/json?",
      "suggest_request=b&",
      "query=",
      encodeURI(this.query),
      "+package%3Achromium&",
      "query_cursor_position=" + this.query.length,
      "&",
      "suggest_request=e",
      // Note: when invoking from cs.chromium.org there is also a "sid"
      // parameter, but I don't know how to generate it, nor does it appear
      // to matter if it's left out.
    ].join("");
  }
}
