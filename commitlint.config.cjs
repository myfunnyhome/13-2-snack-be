module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'chore', 'refactor', 'docs']],
    'subject-case': [0, 'never'],
  },
};
