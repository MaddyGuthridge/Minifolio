// Yoinked from https://github.com/dbolack-ab/marked-subsuper-text
// ===============================================================
// MIT License

// Copyright (c) 2021 @dbolack-ab

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import type { MarkedExtension } from 'marked';

export default function (): MarkedExtension {
  return {
    extensions: [
      {
        name: 'subSuperText',
        level: 'inline',
        start(src) { return (/\^/m.exec(src))?.index }, // Hint to Marked.js to stop and check for a match
        tokenizer(src, _tokens) {
          // I (Maddy) deleted some extra escapes here, since eslint says they do nothing
          const superRegex = /^\^(?!\s)(?=([^\n^]*[^\s^]))\1\^/m;
          const subRegex = /^\^\^(?!\s)(?=([^\n^]*[^\s^]))\1\^\^/m;
          let isSuper = false;
          let match = subRegex.exec(src);
          if (!match) {
            match = superRegex.exec(src);
            if (match)
              isSuper = true;
          }
          if (match?.length) {
            return {
              type: 'subSuperText', // Should match "name" above
              raw: match[0], // Text to consume from the source
              tag: isSuper ? 'sup' : 'sub',
              tokens: this.lexer.inlineTokens(match[1]),
            };
          }
        },
        renderer(token) {
          // @ts-expect-error ceebs fixing this code tbh. Maybe some other time...
          return `<${token.tag}>${this.parser.parseInline(token.tokens)}</${token.tag}>`;
        },
      },
    ],
  };
}
