// Release config for webgrip/common-charts.
//
// Forge-agnostic: ONE config, correct on both Forgejo (leading) and GitHub (mirror). The publish
// plugin and the version commit-back are gated on GITEA_ACTIONS — an intrinsic Forgejo-runner env
// var (=true on Forgejo, unset on GitHub; GITHUB_ACTIONS is set on BOTH so it can't discriminate).
// See the `forgejo-port-workflows` skill in the homelab-cluster repo.
const onForgejo = !!process.env.GITEA_ACTIONS;

const commitAnalyzer = ['@semantic-release/commit-analyzer'];
const releaseNotes = ['@semantic-release/release-notes-generator'];
const changelog = ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }];

// Bumps the chart's version/appVersion in Chart.yaml before the commit-back below.
const helm = ['semantic-release-helm3', { chartPath: './ops/helm/common-helpers' }];

// Version/changelog commit-back ONLY on Forgejo (the sole release authority). The GitHub mirror must
// never re-version. `[skip ci]` is honoured by both forges, so the Forgejo→GitHub mirror push of this
// commit re-triggers nothing. (Dropped the inherited `composer.json` asset — this repo has none.)
const commitBack = onForgejo
    ? [
          [
              '@semantic-release/git',
              {
                  assets: ['CHANGELOG.md', 'ops/helm/common-helpers/Chart.yaml'],
                  message: 'chore(release): ${nextRelease.version} [skip ci]',
              },
          ],
      ]
    : [];

// Exposes the version to the calling workflow so the chart-push job can consume it.
const exec = [
    '@semantic-release/exec',
    { successCmd: 'echo "version=${nextRelease.version}" >> $GITHUB_OUTPUT' },
];

// Forgejo: @saithodev/semantic-release-gitea reads GITEA_URL/GITEA_TOKEN set by the reusable action.
const giteaPublish = ['@saithodev/semantic-release-gitea', {}];
// GitHub: unchanged from the original config (kept correct in case GitHub ever cuts a release).
const githubPublish = ['@semantic-release/github', {}];

module.exports = {
    branches: ['main'],
    tagFormat: '${version}',
    plugins: [
        commitAnalyzer,
        releaseNotes,
        changelog,
        helm,
        ...commitBack,
        exec,
        onForgejo ? giteaPublish : githubPublish,
    ],
};
